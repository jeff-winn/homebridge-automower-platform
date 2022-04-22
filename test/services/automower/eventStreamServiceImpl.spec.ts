import { Logging } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { OAuthTokenManager } from '../../../src/authentication/oauthTokenManager';
import { StatusEvent } from '../../../src/clients/events';
import { AccessToken } from '../../../src/clients/model';
import { Timer } from '../../../src/primitives/timer';
import { AutomowerEventStreamClientSpy } from '../../clients/automowerEventStreamClientSpy';
import { EventStreamServiceImplSpy } from './eventStreamServiceImplSpy';

describe('eventStreamService', () => {
    let tokenManager: Mock<OAuthTokenManager>;
    let stream: AutomowerEventStreamClientSpy;
    let log: Mock<Logging>;
    let timer: Mock<Timer>;

    let target: EventStreamServiceImplSpy;

    beforeEach(() => {
        tokenManager = new Mock<OAuthTokenManager>();
        stream = new AutomowerEventStreamClientSpy();
        log = new Mock<Logging>();
        timer = new Mock<Timer>();

        target = new EventStreamServiceImplSpy(tokenManager.object(), stream, log.object(), timer.object());
    });

    it('should get the token and login to the stream', async () => {
        const token: AccessToken = {
            value: 'abcd1234',
            provider: 'provider'
        };

        tokenManager.setup(o => o.getCurrentToken()).returns(Promise.resolve(token));       
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.start();

        expect(stream.opened).toBeTruthy();
        expect(stream.callbackSet).toBeTruthy();

        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should close the stream', async () => {
        timer.setup(o => o.stop()).returns(undefined);

        await target.stop();

        expect(stream.closed).toBeTruthy();

        timer.verify(o => o.stop(), Times.Once());
    });

    it('should ping the server when no event has been received yet', async () => {
        const started = new Date(new Date().getTime() - (target.getReconnectInterval() - 100000));
        target.unsafeSetLastEventReceived(undefined);
        target.unsafeSetStarted(started);
        
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAlive();        

        expect(stream.keptAlive).toBeTruthy();

        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should reconnect the client when never received event', async () => {
        const started = new Date(new Date().getTime() - target.getReconnectInterval() - 1);
        target.unsafeSetLastEventReceived(undefined);
        target.unsafeSetStarted(started);
        
        const token: AccessToken = { 
            value: 'abcd1234',
            provider: 'bob'
        };
        
        tokenManager.setup(o => o.getCurrentToken()).returns(Promise.resolve(token));
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAlive();        

        expect(stream.closed).toBeTruthy();        
        expect(stream.opened).toBeTruthy();

        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should ping the server when the last event has been recent', async () => {
        const lastEventReceived = new Date(new Date().getTime() - (target.getReconnectInterval() - 100000));
        target.unsafeSetLastEventReceived(lastEventReceived);
        
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAlive();        

        expect(stream.keptAlive).toBeTruthy();

        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should reconnect the client when too long since last event received', async () => {
        const lastReceivedDate = new Date(new Date().getTime() - target.getReconnectInterval() - 1);
        target.unsafeSetLastEventReceived(lastReceivedDate);

        const token: AccessToken = { 
            value: 'abcd1234',
            provider: 'bob'
        };
        
        tokenManager.setup(o => o.getCurrentToken()).returns(Promise.resolve(token));
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAlive();        

        expect(stream.closed).toBeTruthy();        
        expect(stream.opened).toBeTruthy();

        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should do nothing when settings-event is received', async () => {
        await target.unsafeEventReceived({
            id: '12345',
            type: 'settings-event'
        });
    });

    it('should do nothing when positions-event is received', async () => {
        await target.unsafeEventReceived({
            id: '12345',
            type: 'settings-event'
        });
    });

    it('should do nothing when status-event is received with no callback', async () => {
        await target.unsafeEventReceived({
            id: '12345',
            type: 'status-event'
        });
    });

    it('should run the callback when settings-event is received', async () => {
        let executed = false;
        const event: StatusEvent = {
            id: '12345',
            type: 'status-event',
            attributes: {
                battery: {
                    batteryPercent: 100
                },
                metadata: {
                    connected: true,
                    statusTimestamp: 0
                },
                mower: {
                    activity: 'hello',
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: 'mode',
                    state: 'state'
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: 'no'
                    },
                    restrictedReason: 'none'
                }
            }
        };

        target.onStatusEventReceived(() => {
            executed = true;
            return Promise.resolve(undefined);
        });

        await target.unsafeEventReceived(event);

        expect(executed).toBeTruthy();
    });

    it('should log a warning when the event is unknown', async () => {
        log.setup(o => o.warn(It.IsAny<string>())).returns(undefined);
        
        await target.unsafeEventReceived({
            id: '12345',
            type: 'unknown'
        });        

        log.verify(o => o.warn(It.IsAny<string>()), Times.Once());
    });
});