import { It, Mock, Times } from 'moq.ts';

import { AccessTokenManager } from '../../../src/services/automower/accessTokenManager';
import { AutomowerEventTypes, PositionsEvent, SettingsEvent, StatusEvent } from '../../../src/events';
import { BadCredentialsError } from '../../../src/errors/badCredentialsError';
import { AccessToken, Activity, HeadlightMode, Mode, OverrideAction, RestrictedReason, State } from '../../../src/model';
import { Timer } from '../../../src/primitives/timer';
import { AutomowerEventStreamClientStub } from '../../clients/automowerEventStreamClientStub';
import { EventStreamServiceImplSpy } from './eventStreamServiceImplSpy';
import { PlatformLogger } from '../../../src/diagnostics/platformLogger';

describe('EventStreamServiceImpl', () => {
    let tokenManager: Mock<AccessTokenManager>;
    let stream: AutomowerEventStreamClientStub;
    let log: Mock<PlatformLogger>;
    let timer: Mock<Timer>;

    let target: EventStreamServiceImplSpy;

    beforeEach(() => {
        tokenManager = new Mock<AccessTokenManager>();
        stream = new AutomowerEventStreamClientStub();
        timer = new Mock<Timer>();

        log = new Mock<PlatformLogger>();
        log.setup(o => o.debug(It.IsAny())).returns(undefined);

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

    it('should not close the stream when not connected', async () => {
        timer.setup(o => o.stop()).returns(undefined);

        await target.stop();

        expect(stream.closed).toBeFalsy();

        timer.verify(o => o.stop(), Times.Once());
    });
    
    it('should log when connected event received', async () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        target.unsafeOnConnectedEventReceived();

        log.verify(o => o.info(It.IsAny()), Times.Once());
    });

    it('should handle disconnected event received', async () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);
        timer.setup(o => o.stop()).returns(undefined);

        // Don't need to test the keep alive again here, just make sure it would have ran.
        target.shouldRunKeepAlive = false;

        target.unsafeOnDisconnectedEventReceived();

        expect(target.keepAliveExecuted).toBeTruthy();

        log.verify(o => o.info(It.IsAny()), Times.Once());
        timer.verify(o => o.stop(), Times.Once());
    });

    it('should log when error event received', async () => {
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        await target.unsafeOnErrorEventReceived({
            error: 'error',
            message: 'message',
            type: 'type'
        });

        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should close the stream when connected', async () => {
        timer.setup(o => o.stop()).returns(undefined);
        stream.opened = true;

        await target.stop();

        expect(stream.closed).toBeTruthy();

        timer.verify(o => o.stop(), Times.Once());
    });

    it('should ping the server when no event has been received yet', async () => {
        const started = new Date(new Date().getTime() - (target.getReconnectInterval() - 100000));
        target.unsafeSetLastEventReceived(undefined);
        target.unsafeSetStarted(started);
        
        stream.opened = true;
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAlive();

        expect(stream.keptAlive).toBeTruthy();

        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should flag the token as invalid when failing to authenticate', async () => {
        stream.opened = false;

        tokenManager.setup(o => o.getCurrentToken()).throws(new BadCredentialsError('Unable to authenticate', 'ERR0000'));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        let thrown = false;
        try {
            await target.unsafeKeepAlive();
        } catch (e) {
            thrown = true;
        }

        expect(thrown).toBeFalsy();

        tokenManager.verify(o => o.flagAsInvalid(), Times.Once());
        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    // WARNING: throwing errors while reconnecting will cause the process running homebridge to be restarted
    // as it occurrs on a background thread.
    it('should not throw errors when reconnecting', async () => {
        stream.opened = false;

        tokenManager.setup(o => o.getCurrentToken()).throws(new Error('Unable to authenticate'));
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAlive();

        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should reconnect the client when disconnected', async () => {       
        const token: AccessToken = { 
            value: 'abcd1234',
            provider: 'bob'
        };
        
        stream.opened = false;
        tokenManager.setup(o => o.getCurrentToken()).returns(Promise.resolve(token));
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAlive();        

        expect(stream.opened).toBeTruthy();

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
        
        stream.opened = true;
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
        
        stream.opened = true;
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

        stream.opened = true;
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
            type: AutomowerEventTypes.SETTINGS
        });
    });

    it('should do nothing when positions-event is received', async () => {
        await target.unsafeEventReceived({
            id: '12345',
            type: AutomowerEventTypes.POSITIONS
        });
    });

    it('should do nothing when status-event is received with no callback', async () => {
        await target.unsafeEventReceived({
            id: '12345',
            type: AutomowerEventTypes.STATUS
        });
    });

    it('should run the callback when positions-event is received', async () => {
        const event: PositionsEvent = {
            id: '12345',
            type: AutomowerEventTypes.POSITIONS,
            attributes: {
                positions: [
                    {
                        latitude: 10,
                        longitude: 10
                    }
                ]
            }
        };

        let executed = false;
        await target.onPositionsEventReceived(() => {
            executed = true;
            return Promise.resolve(undefined);
        });

        await target.unsafeEventReceived(event);

        expect(executed).toBeTruthy();
    });

    it('should run the callback when settings-event is received', async () => {
        let executed = false;
        const event: SettingsEvent = {
            id: '12345',
            type: AutomowerEventTypes.SETTINGS,
            attributes: {
                calendar: {
                    tasks: []
                },
                cuttingHeight: 10,
                headlight: {
                    mode: HeadlightMode.EVENING_ONLY
                }
            }
        };

        target.onSettingsEventReceived(() => {
            executed = true;
            return Promise.resolve(undefined);
        });

        target.unsafeEventReceived(event);

        expect(executed).toBeTruthy();
    });

    it('should run the callback when status-event is received', async () => {
        let executed = false;
        const event: StatusEvent = {
            id: '12345',
            type: AutomowerEventTypes.STATUS,
            attributes: {
                battery: {
                    batteryPercent: 100
                },
                metadata: {
                    connected: true,
                    statusTimestamp: 0
                },
                mower: {
                    activity: Activity.MOWING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: OverrideAction.NO_SOURCE
                    },
                    restrictedReason: RestrictedReason.NOT_APPLICABLE
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
        log.setup(o => o.warn(It.IsAny<string>(), It.IsAny())).returns(undefined);
        
        await target.unsafeEventReceived({
            id: '12345',
            type: AutomowerEventTypes.UNKNOWN
        });        

        log.verify(o => o.warn(It.IsAny<string>(), It.IsAny<string>()), Times.Once());
    });
});