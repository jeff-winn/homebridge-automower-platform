import { Logging } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { OAuthTokenManager } from '../../../src/authentication/oauthTokenManager';
import { AutomowerEvent, StatusEvent } from '../../../src/clients/events';
import { OAuthToken } from '../../../src/clients/model';
import { EventStreamServiceImpl } from '../../../src/services/automower/eventStreamService';
import { AutomowerEventStreamSpy } from './automowerEventStreamSpy';

class EventStreamServiceImplSpy extends EventStreamServiceImpl {
    unsafeEventReceived(event: AutomowerEvent): Promise<void> {
        return this.onEventReceived(event);
    }
}

describe('eventStreamService', () => {
    let tokenManager: Mock<OAuthTokenManager>;
    let stream: AutomowerEventStreamSpy;
    let log: Mock<Logging>;

    let target: EventStreamServiceImplSpy;

    beforeEach(() => {
        tokenManager = new Mock<OAuthTokenManager>();
        stream = new AutomowerEventStreamSpy();
        log = new Mock<Logging>();

        target = new EventStreamServiceImplSpy(tokenManager.object(), stream, log.object());
    });

    it('should get the token and login to the stream', async () => {
        const token: OAuthToken = {
            access_token: 'abcd1234',
            expires_in: 1000,
            provider: 'provider',
            refresh_token: 'r12345',
            scope: 'all the things',
            token_type: 'super token',
            user_id: 'bob'
        };

        tokenManager.setup(o => o.getCurrentToken()).returns(Promise.resolve(token));       

        await target.start();

        expect(stream.opened).toBeTruthy();
        expect(stream.callbackSet).toBeTruthy();
    });

    it('should close the stream', async () => {
        await target.stop();

        expect(stream.closed).toBeTruthy();
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