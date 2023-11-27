import { It, Mock, Times } from 'moq.ts';

import * as model from '../../../../src/model';

import { Activity, HeadlightMode, Mode, MowerState, OverrideAction, RestrictedReason, State } from '../../../../src/clients/automower/automowerClient';
import { AutomowerEventTypes, PositionsEvent, SettingsEvent, StatusEvent } from '../../../../src/clients/automower/automowerEventStreamClient';
import { PlatformLogger } from '../../../../src/diagnostics/platformLogger';
import { BadCredentialsError } from '../../../../src/errors/badCredentialsError';
import { Timer } from '../../../../src/primitives/timer';
import { AccessTokenManager } from '../../../../src/services/husqvarna/accessTokenManager';
import { AutomowerMowerScheduleConverter } from '../../../../src/services/husqvarna/automower/converters/automowerMowerScheduleConverter';
import { AutomowerMowerStateConverter } from '../../../../src/services/husqvarna/automower/converters/automowerMowerStateConverter';
import { AutomowerEventStreamClientStub } from '../../../clients/automower/automowerEventStreamClientStub';
import { AutomowerEventStreamServiceSpy } from './automowerEventStreamServiceSpy';

describe('AutomowerEventStreamService', () => {
    let stateConverter: Mock<AutomowerMowerStateConverter>;
    let scheduleConverter: Mock<AutomowerMowerScheduleConverter>;
    let tokenManager: Mock<AccessTokenManager>;
    let stream: AutomowerEventStreamClientStub;
    let log: Mock<PlatformLogger>;
    let timer: Mock<Timer>;

    let target: AutomowerEventStreamServiceSpy;

    beforeEach(() => {
        stateConverter = new Mock<AutomowerMowerStateConverter>();
        scheduleConverter = new Mock<AutomowerMowerScheduleConverter>();
        tokenManager = new Mock<AccessTokenManager>();
        stream = new AutomowerEventStreamClientStub();
        timer = new Mock<Timer>();

        log = new Mock<PlatformLogger>();
        log.setup(o => o.debug(It.IsAny())).returns(undefined);

        target = new AutomowerEventStreamServiceSpy(stateConverter.object(), scheduleConverter.object(),
            tokenManager.object(), stream, log.object(), timer.object());
    });

    it('should get the token and login to the stream', async () => {
        const token: model.AccessToken = {
            value: 'abcd1234',
            provider: 'provider'
        };

        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));       
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.startAsync();

        expect(stream.opened).toBeTruthy();
        expect(stream.callbackSet).toBeTruthy();
        expect(target.unsafeGetStarted()).toBeDefined();
        expect(target.unsafeGetLastEventReceived()).toBeUndefined();
        
        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should not close the stream when not connected', async () => {
        timer.setup(o => o.stop()).returns(undefined);

        await target.stopAsync();

        expect(stream.closed).toBeFalsy();

        timer.verify(o => o.stop(), Times.Once());
    });    

    it('should not restart the keep alive on error when keep alive is not already active', async () => {
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        target.unsafeClearKeepAliveFlag();

        await expect(target.unsafeOnCheckKeepAliveAsync()).resolves.toBeUndefined();

        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Never());
    });

    it('should restart the keep alive on error when keep alive is already active', async () => {
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        target.unsafeFlagAsKeepAliveActive();

        await expect(target.unsafeOnCheckKeepAliveAsync()).resolves.toBeUndefined();

        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should not run the keep alive when being stopped on disconnect', async () => {
        target.unsafeFlagAsStopping();

        await target.unsafeOnDisconnectedEventReceivedAsync();

        expect(target.unsafeHasStopped()).toBeTruthy();
        expect(target.unsafeIsStopping()).toBeFalsy();
    });

    it('should not run the keep alive when keep alive is already active', async () => {
        target.unsafeFlagAsKeepAliveActive();

        await target.unsafeOnDisconnectedEventReceivedAsync();
    });

    it('should handle disconnected event received', async () => {
        timer.setup(o => o.stop()).returns(undefined);

        // Don't need to test the keep alive again here, just make sure it would have ran.
        target.shouldRunKeepAlive = false;

        await target.unsafeOnDisconnectedEventReceivedAsync();

        expect(target.keepAliveExecuted).toBeTruthy();

        timer.verify(o => o.stop(), Times.Once());
    });

    it('should close the stream when connected', async () => {
        timer.setup(o => o.stop()).returns(undefined);
        stream.opened = true;

        await target.stopAsync();

        expect(stream.closed).toBeTruthy();
        expect(() => target.unsafeIsStopping()).toBeTruthy();

        timer.verify(o => o.stop(), Times.Once());
    });

    it('should ping the server when no event has been received yet', async () => {
        const started = new Date(new Date().getTime() - (target.getReconnectInterval() - 100000));
        target.unsafeSetLastEventReceived(undefined);
        target.unsafeSetStarted(started);
        
        stream.opened = true;
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAliveAsync();

        expect(stream.keptAlive).toBeTruthy();

        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should flag the token as invalid when failing to authenticate', async () => {
        stream.opened = false;

        tokenManager.setup(o => o.getCurrentTokenAsync()).throws(new BadCredentialsError('Unable to authenticate', 'ERR0000'));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        target.unsafeKeepAliveCallback();

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);

        tokenManager.verify(o => o.flagAsInvalid(), Times.Once());
        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should restart the keep alive when when unable to authenticate', async () => {
        stream.opened = false;

        tokenManager.setup(o => o.getCurrentTokenAsync()).throws(new Error('Ouch'));
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        target.unsafeKeepAliveCallback();

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);

        expect(target.unsafeIsKeepAliveActive()).toBeFalsy();
        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
    });

    // WARNING: throwing errors while reconnecting will cause the process running homebridge to be restarted
    // as it occurrs on a background thread.
    it('should not throw errors when reconnecting', async () => {
        stream.opened = false;

        tokenManager.setup(o => o.getCurrentTokenAsync()).throws(new Error('Unable to authenticate'));
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAliveCallback();

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);

        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should reconnect the client when disconnected', async () => {       
        const token: model.AccessToken = { 
            value: 'abcd1234',
            provider: 'bob'
        };
        
        stream.opened = false;
        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAliveAsync();        

        expect(stream.opened).toBeTruthy();
    });

    it('should reconnect the client when never received event', async () => {
        const started = new Date(new Date().getTime() - target.getReconnectInterval() - 1);
        target.unsafeSetLastEventReceived(undefined);
        target.unsafeSetStarted(started);
        
        const token: model.AccessToken = { 
            value: 'abcd1234',
            provider: 'bob'
        };
        
        stream.opened = true;
        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAliveAsync();        

        expect(stream.closed).toBeTruthy();        
        expect(stream.opened).toBeTruthy();
    });

    it('should ping the server when the last event has been recent', async () => {
        const lastEventReceived = new Date(new Date().getTime() - (target.getReconnectInterval() - 100000));
        target.unsafeSetLastEventReceived(lastEventReceived);
        
        stream.opened = true;
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAliveAsync();        

        expect(stream.keptAlive).toBeTruthy();

        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should start the keep alive timer on connected if keep alive is active', async () => {
        timer.setup(o => o.start(It.IsAny(), It.IsAny())).returns(undefined);

        target.unsafeFlagAsKeepAliveActive();

        await expect(target.unsafeOnCheckKeepAliveAsync()).resolves.toBeUndefined();

        expect(target.unsafeIsKeepAliveActive()).toBeFalsy();

        timer.verify(o => o.start(It.IsAny(), It.IsAny()), Times.Once());        
    });

    it('should reconnect the client when too long since last event received', async () => {
        const lastReceivedDate = new Date(new Date().getTime() - target.getReconnectInterval() - 1);
        target.unsafeSetLastEventReceived(lastReceivedDate);

        const token: model.AccessToken = { 
            value: 'abcd1234',
            provider: 'bob'
        };

        stream.opened = true;
        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAliveAsync();        

        expect(stream.closed).toBeTruthy();
        expect(stream.opened).toBeTruthy();
        expect(target.unsafeGetStarted()).toBeDefined();
        expect(target.unsafeGetLastEventReceived()).toBeUndefined();
    });

    it('should do nothing when settings-event is received', async () => {
        const e: SettingsEvent = {
            id: '12345',
            type: AutomowerEventTypes.SETTINGS,
            attributes: { }
        };

        await target.unsafeEventReceived(e);
    });

    it('should do nothing when positions-event is received', async () => {
        const e: PositionsEvent = {
            id: '12345',
            type: AutomowerEventTypes.POSITIONS,
            attributes: { 
                positions: []
            }
        };

        await target.unsafeEventReceived(e);
    });   
    
    it('should run the callback when settings-event is received', async () => {
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

        let executed = false;
        target.setOnSettingsEventCallback(() => {
            executed = true;
            return Promise.resolve(undefined);
        });

        await expect(target.unsafeEventReceived(event)).resolves.toBeUndefined();

        expect(executed).toBeTruthy();
    });

    it('should run the callback when status-event is received', async () => {
        const mowerState: MowerState = {
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };

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
                mower: mowerState,
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: OverrideAction.NO_SOURCE
                    },
                    restrictedReason: RestrictedReason.NOT_APPLICABLE
                }
            }
        };

        stateConverter.setup(o => o.convertMowerState(mowerState)).returns({
            activity: model.Activity.MOWING,
            state: model.State.IN_OPERATION
        });
        
        let executed = false;
        target.setOnStatusEventCallback(() => {
            executed = true;
            return Promise.resolve(undefined);
        });

        await expect(target.unsafeEventReceived(event)).resolves.toBeUndefined();

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