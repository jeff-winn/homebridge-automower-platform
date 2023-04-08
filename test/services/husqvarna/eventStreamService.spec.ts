import { It, Mock, Times } from 'moq.ts';

import { EventStreamClient } from '../../../src/clients/eventStreamClient';
import { PlatformLogger } from '../../../src/diagnostics/platformLogger';
import { BadCredentialsError } from '../../../src/errors/badCredentialsError';
import * as model from '../../../src/model';
import { Timer } from '../../../src/primitives/timer';
import { AccessTokenManager } from '../../../src/services/husqvarna/accessTokenManager';
import { EventStreamServiceStub } from './eventStreamServiceStub';

describe('AbstractEventStreamService', () => {
    let tokenManager: Mock<AccessTokenManager>;
    let stream: Mock<EventStreamClient>;
    let log: Mock<PlatformLogger>;
    let timer: Mock<Timer>;

    let target: EventStreamServiceStub;
    
    beforeEach(() => {
        tokenManager = new Mock<AccessTokenManager>();
        stream = new Mock<EventStreamClient>();
        log = new Mock<PlatformLogger>();
        timer = new Mock<Timer>();

        target = new EventStreamServiceStub(tokenManager.object(), stream.object(), log.object(), timer.object());
    });

    it('should get the token and login to the stream', async () => {
        const token: model.AccessToken = {
            value: 'abcd1234',
            provider: 'provider'
        };

        stream.setup(o => o.open(token)).returnsAsync(undefined);
        stream.setup(o => o.setOnConnectedCallback(It.IsAny<(() => Promise<void>)>())).returns(undefined);
        stream.setup(o => o.setOnDisconnectedCallback(It.IsAny<(() => Promise<void>)>())).returns(undefined);
        stream.setup(o => o.setOnErrorCallback(It.IsAny<(() => Promise<void>)>())).returns(undefined);

        tokenManager.setup(o => o.getCurrentToken()).returns(Promise.resolve(token));       
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        log.setup(o => o.debug('OPENING_CONNECTION')).returns(undefined);

        await expect(target.start()).resolves.toBeUndefined();
        
        stream.verify(o => o.open(token), Times.Once());
        stream.verify(o => o.setOnConnectedCallback(It.IsAny<(() => Promise<void>)>()), Times.Once());
        stream.verify(o => o.setOnDisconnectedCallback(It.IsAny<(() => Promise<void>)>()), Times.Once());
        stream.verify(o => o.setOnErrorCallback(It.IsAny<(() => Promise<void>)>()), Times.Once());

        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should not close the stream when not connected', async () => {
        timer.setup(o => o.stop()).returns(undefined);
        stream.setup(o => o.isConnected()).returns(false);
        stream.setup(o => o.close()).returnsAsync(undefined);

        await expect(target.stop()).resolves.toBeUndefined();
        
        stream.verify(o => o.close(), Times.Never());
        timer.verify(o => o.stop(), Times.Once());
    });
    
    it('should log when connected event received', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);

        await expect(target.unsafeOnConnectedEventReceived()).resolves.toBeUndefined();

        log.verify(o => o.debug(It.IsAny()), Times.Once());
    });

    it('should not restart the keep alive on error when keep alive is not already active', async () => {
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        target.unsafeClearKeepAliveFlag();

        await expect(target.unsafeOnErrorEventReceived()).resolves.toBeUndefined();

        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Never());
    });

    it('should restart the keep alive on error when keep alive is already active', async () => {
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        target.unsafeFlagAsKeepAliveActive();

        await expect(target.unsafeOnErrorEventReceived()).resolves.toBeUndefined();

        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should not run the keep alive when being stopped on disconnect', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        target.unsafeFlagAsStopping();

        await target.unsafeOnDisconnectedEventReceived();

        expect(target.unsafeHasStopped()).toBeTruthy();
        expect(target.unsafeIsStopping()).toBeFalsy();

        log.verify(o => o.debug('DISCONNECTED'), Times.Once());
    });

    it('should not run the keep alive when keep alive is already active', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);

        target.unsafeFlagAsKeepAliveActive();

        await target.unsafeOnDisconnectedEventReceived();

        log.verify(o => o.debug('DISCONNECTED'), Times.Once());
    });

    it('should handle disconnected event received', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        timer.setup(o => o.stop()).returns(undefined);

        // Don't need to test the keep alive again here, just make sure it would have ran.
        target.shouldRunKeepAlive = false;

        await target.unsafeOnDisconnectedEventReceived();

        expect(target.keepAliveExecuted).toBeTruthy();

        log.verify(o => o.debug(It.IsAny()), Times.Once());
        timer.verify(o => o.stop(), Times.Once());
    });

    it('should close the stream when connected', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        timer.setup(o => o.stop()).returns(undefined);

        stream.setup(o => o.isConnected()).returns(true);
        stream.setup(o => o.close()).returnsAsync(undefined);

        await expect(target.stop()).resolves.toBeUndefined();
        expect(() => target.unsafeIsStopping()).toBeTruthy();

        stream.verify(o => o.close(), Times.Once());
        timer.verify(o => o.stop(), Times.Once());
    });

    it('should ping the server when no event has been received yet', async () => {
        const started = new Date(new Date().getTime() - (target.getReconnectInterval() - 100000));
        target.unsafeSetLastEventReceived(undefined);
        target.unsafeSetStarted(started);
        
        stream.setup(o => o.isConnected()).returns(true);
        stream.setup(o => o.ping()).returns(undefined);
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await expect(target.unsafeKeepAlive()).resolves.toBeUndefined();

        stream.verify(o => o.ping(), Times.Once());
        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should flag the token as invalid when failing to authenticate', async () => {
        stream.setup(o => o.isConnected()).returns(false);

        tokenManager.setup(o => o.getCurrentToken()).throws(new BadCredentialsError('Unable to authenticate', 'ERR0000'));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await expect(target.unsafeKeepAlive()).resolves.toBeUndefined();

        tokenManager.verify(o => o.flagAsInvalid(), Times.Once());
        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should restart the keep alive when when unable to authenticate', async () => {
        tokenManager.setup(o => o.getCurrentToken()).throws(new Error('Ouch'));
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await target.unsafeKeepAlive();

        expect(target.unsafeIsKeepAliveActive()).toBeFalsy();
        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
    });

    // WARNING: throwing errors while reconnecting will cause the process running homebridge to be restarted
    // as it occurrs on a background thread.
    it('should not throw errors when reconnecting', async () => {
        tokenManager.setup(o => o.getCurrentToken()).throws(new Error('Unable to authenticate'));

        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await expect(target.unsafeKeepAlive()).resolves.toBeUndefined();

        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should reconnect the client when disconnected', async () => {       
        const token: model.AccessToken = { 
            value: 'abcd1234',
            provider: 'bob'
        };
        
        tokenManager.setup(o => o.getCurrentToken()).returns(Promise.resolve(token));
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);
        stream.setup(o => o.isConnected()).returns(false);
        stream.setup(o => o.open(token)).returnsAsync(undefined);
        log.setup(o => o.debug(It.IsAny())).returns(undefined);

        await expect(target.unsafeKeepAlive()).resolves.toBeUndefined();

        stream.verify(o => o.open(token), Times.Once());
        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Never());
    });

    it('should reconnect the client when never received event', async () => {
        const started = new Date(new Date().getTime() - target.getReconnectInterval() - 1);
        target.unsafeSetLastEventReceived(undefined);
        target.unsafeSetStarted(started);
        
        const token: model.AccessToken = { 
            value: 'abcd1234',
            provider: 'bob'
        };
        
        stream.setup(o => o.isConnected()).returns(true);
        stream.setup(o => o.open(token)).returnsAsync(undefined);
        stream.setup(o => o.close()).returnsAsync(undefined);
        tokenManager.setup(o => o.getCurrentToken()).returns(Promise.resolve(token));
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);
        log.setup(o => o.debug(It.IsAny())).returns(undefined);

        await expect(target.unsafeKeepAlive()).resolves.toBeUndefined();
        
        stream.verify(o => o.close(), Times.Once());
        stream.verify(o => o.open(token), Times.Once());
    });

    it('should ping the server when the last event has been recent', async () => {
        const lastEventReceived = new Date(new Date().getTime() - (target.getReconnectInterval() - 100000));
        target.unsafeSetLastEventReceived(lastEventReceived);
        
        stream.setup(o => o.isConnected()).returns(true);
        stream.setup(o => o.ping()).returns(undefined);
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await expect(target.unsafeKeepAlive()).resolves.toBeUndefined();

        stream.verify(o => o.ping(), Times.Once());
        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
    });

    it('should start the keep alive timer on connected if keep alive is active', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny(), It.IsAny())).returns(undefined);

        target.unsafeFlagAsKeepAliveActive();

        await expect(target.unsafeOnConnectedEventReceived()).resolves.toBeUndefined();

        expect(target.unsafeIsKeepAliveActive()).toBeFalsy();

        log.verify(o => o.debug('CONNECTED'), Times.Once());
        timer.verify(o => o.start(It.IsAny(), It.IsAny()), Times.Once());        
    });

    it('should reconnect the client when too long since last event received', async () => {
        const lastReceivedDate = new Date(new Date().getTime() - target.getReconnectInterval() - 1);
        target.unsafeSetLastEventReceived(lastReceivedDate);

        const token: model.AccessToken = { 
            value: 'abcd1234',
            provider: 'bob'
        };

        stream.setup(o => o.isConnected()).returns(true);
        stream.setup(o => o.close()).returnsAsync(undefined);
        stream.setup(o => o.open(token)).returnsAsync(undefined);
        tokenManager.setup(o => o.getCurrentToken()).returns(Promise.resolve(token));
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);
        log.setup(o => o.debug(It.IsAny())).returns(undefined);

        await expect(target.unsafeKeepAlive()).resolves.toBeUndefined();

        stream.verify(o => o.close(), Times.Once());
        stream.verify(o => o.open(token), Times.Once());
        expect(target.unsafeGetStarted()).toBeDefined();
        expect(target.unsafeGetLastEventReceived()).toBeUndefined();
    });
});