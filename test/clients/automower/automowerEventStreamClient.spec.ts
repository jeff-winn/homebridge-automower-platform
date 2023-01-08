import { It, Mock, Times } from 'moq.ts';

import * as constants from '../../../src/settings';

import { AutomowerEvent, AutomowerEventTypes, ConnectedEvent, ErrorEvent } from '../../../src/clients/automower/automowerEventStreamClient';
import { WebSocketWrapper } from '../../../src/clients/primitives/webSocketWrapper';
import { PlatformLogger } from '../../../src/diagnostics/platformLogger';
import { AutomowerEventStreamClientImplSpy } from './automowerEventStreamClientImplSpy';

describe('AutomowerEventStreamClientImpl', () => {
    let socket: Mock<WebSocketWrapper>;
    let log: Mock<PlatformLogger>;

    let target: AutomowerEventStreamClientImplSpy;

    beforeEach(() => {
        socket = new Mock<WebSocketWrapper>();
        log = new Mock<PlatformLogger>();

        target = new AutomowerEventStreamClientImplSpy(constants.AUTOMOWER_STREAM_API_BASE_URL, log.object());
    });

    it('should open the socket and connect all events', () => {
        socket.setup(o => o.on(It.IsAny(), It.IsAny())).returns(socket.object());

        target.callback = () => socket.object();

        target.open({
            value: 'hello',
            provider: 'world'
        });

        expect(target.isConnecting()).toBeTruthy();
        socket.verify(o => o.on('message', It.IsAny()), Times.Once());
        socket.verify(o => o.on('error', It.IsAny()), Times.Once());
        socket.verify(o => o.on('close', It.IsAny()), Times.Once());
    });

    it('should close the socket when being reopened', () => {
        socket.setup(o => o.on(It.IsAny(), It.IsAny())).returns(socket.object());
        socket.setup(o => o.close()).returns(undefined);

        const socket2 = new Mock<WebSocketWrapper>();
        socket2.setup(o => o.on(It.IsAny(), It.IsAny())).returns(socket.object());

        let attempt = 0;
        target.callback = () => {
            attempt++;

            if (attempt === 1) {
                return socket.object();
            } else {
                return socket2.object();
            }
        };

        target.open({
            value: 'hello1',
            provider: 'world1'
        });

        target.open({
            value: 'hello2',
            provider: 'world2'
        });

        socket.verify(o => o.close(), Times.Once());
    });

    it('should ping socket when opened', () => {
        socket.setup(o => o.on(It.IsAny(), It.IsAny())).returns(socket.object());
        socket.setup(o => o.ping(It.IsAny())).returns(undefined);

        target.callback = () => socket.object();
        target.open({
            value: 'hello1',
            provider: 'world1'
        });

        target.ping();

        socket.verify(o => o.ping('ping'), Times.Once());
    });

    it('should return undefined when not connected', () => {
        expect(target.getConnectionId()).toBeUndefined();
    });

    it('should not throw an error when ping without being opened', () => {
        expect(() => target.ping()).not.toThrow();
    });

    it('should return false when not connected', () => {
        expect(target.isConnected()).toBeFalsy();
    });
    
    it('should do nothing when no callback is set on error received', () => {
        target.unsafeOnErrorReceived({
            error: 'error',
            message: 'error message',
            type: 'error type'
        });
    });

    it('should log errors thrown when error callback is executed', () => {
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        target.onError(() => {
            throw new Error('Ouch');
        });

        target.unsafeOnErrorReceived({
            error: 'error',
            message: 'error message',
            type: 'error type'
        });

        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should log errors thrown when disconnect callback is executed', () => {
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        target.unsafeSetConnected(true);
        target.onDisconnected(() => {
            throw new Error('Ouch');
        });

        target.unsafeOnCloseReceived();

        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should handle unable to connect when closed before connected', () => {        
        log.setup(o => o.info(It.IsAny())).returns(undefined);
        
        let disconnected = false;
        target.onDisconnected(() => {
            disconnected = true;

            return Promise.resolve(undefined);
        });

        target.unsafeOnConnecting();
        target.unsafeOnCloseReceived();

        expect(target.isConnecting()).toBeFalsy();
        expect(target.isConnected()).toBeFalsy();

        // We don't want disconnected to fire when it never connected as this would cause constant reconnect attempts.
        expect(disconnected).toBeFalsy();
    });

    it('should handle errors thrown on connected event', () => {
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        target.onConnected(() => {
            throw new Error('Ouch');
        });

        target.unsafeOnConnectedReceived({
            connected: true,
            connectionId: '12345'
        });

        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should handle disconnected when closed after connected', () => {        
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        let disconnected = false;
        target.onDisconnected(() => {
            disconnected = true;

            return Promise.resolve(undefined);
        });

        target.unsafeOnConnectedReceived({
            connected: true,
            connectionId: '12345'
        });

        target.unsafeOnCloseReceived();

        expect(target.isConnecting()).toBeFalsy();
        expect(target.isConnected()).toBeFalsy();
        expect(disconnected).toBeTruthy();
    });

    it('should handle when an error has been received', () => {
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        const err: ErrorEvent = {
            error: 'hello',
            message: 'world',
            type: 'fake'
        };

        let handled = false;
        target.onError(() => {
            handled = true;

            return Promise.resolve(undefined);
        });

        target.unsafeOnErrorReceived(err);        

        expect(handled).toBeTruthy();
    });

    it('should do nothing when not connected on close', () => {
        expect(() => target.close()).not.toThrow();
    });

    it('should terminate the connection when connected on close', () => {
        socket.setup(o => o.on(It.IsAny(), It.IsAny())).returns(socket.object());
        socket.setup(o => o.terminate()).returns(undefined);

        target.callback = () => socket.object();

        target.open({
            value: 'hello1',
            provider: 'world1'
        });

        target.close();

        socket.verify(o => o.terminate(), Times.Once());
    });
    
    it('should set the callback', () => {
        target.on(() => Promise.resolve(undefined));

        expect(target.isCallbackSet()).toBeTruthy();
    });

    it('should return when the buffer is empty', () => {
        const payload = Buffer.from([]);

        expect(() => target.unsafeOnSocketMessageReceived(payload)).not.toThrow();
    });

    it('should log an error when invalid json is received', () => {
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        const payload = Buffer.from(' ');

        target.unsafeOnSocketMessageReceived(payload);

        log.verify(o => o.error('ERROR_PROCESSING_MESSAGE', It.IsAny()), Times.Once());
    });

    it('should handle the connected event', () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const id = '12345';
        const event: ConnectedEvent = {
            connected: true,
            connectionId: id
        };

        let connected = false;
        target.onConnected(() => {
            connected = true;

            return Promise.resolve(undefined);
        });

        const payload = Buffer.from(JSON.stringify(event));

        target.unsafeOnSocketMessageReceived(payload);
        
        expect(target.isConnected()).toBeTruthy();
        expect(target.getConnectionId()).toBe(id);
        expect(connected).toBeTruthy();
    });

    it('should ignore the event when no type is provided', () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        const payload = Buffer.from(JSON.stringify({ }));

        expect(() => target.unsafeOnSocketMessageReceived(payload)).not.toThrow();
    });

    it('should ignore the mower event without a callback', () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        const id = '12345';
        const event: AutomowerEvent = {
            id: id,
            type: AutomowerEventTypes.UNKNOWN
        };

        const payload = Buffer.from(JSON.stringify(event));

        target.unsafeOnSocketMessageReceived(payload);        
    });

    it('should handle the mower event with a callback', () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        const id = '12345';
        const event: AutomowerEvent = {
            id: id,
            type: AutomowerEventTypes.UNKNOWN
        };

        const payload = Buffer.from(JSON.stringify(event));
        let executed = false;

        target.on((e1) => {
            expect(e1).toStrictEqual(event);

            executed = true;
            return Promise.resolve(undefined);
        });

        target.unsafeOnSocketMessageReceived(payload);

        expect(executed).toBeTruthy();
    });
});