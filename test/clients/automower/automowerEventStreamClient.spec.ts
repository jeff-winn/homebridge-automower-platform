import { It, Mock, Times } from 'moq.ts';

import * as constants from '../../../src/settings';

import { AutomowerEvent, AutomowerEventTypes, ConnectedEvent, ErrorEvent } from '../../../src/clients/automower/automowerEventStreamClient';
import { PlatformLogger } from '../../../src/diagnostics/platformLogger';
import { WebSocketWrapper } from '../../../src/primitives/webSocketWrapper';
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

    it('should open the socket and connect all events', async () => {
        socket.setup(o => o.on(It.IsAny(), It.IsAny())).returns(socket.object());

        target.callback = () => socket.object();

        await expect(target.open({
            value: 'hello',
            provider: 'world'
        })).resolves.toBeUndefined();
        
        expect(target.isConnecting()).toBeTruthy();
        
        socket.verify(o => o.on('message', It.IsAny()), Times.Once());
        socket.verify(o => o.on('error', It.IsAny()), Times.Once());
        socket.verify(o => o.on('close', It.IsAny()), Times.Once());
    });

    it('should close the socket when being reopened', async () => {
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

        await target.open({
            value: 'hello1',
            provider: 'world1'
        });

        await target.open({
            value: 'hello2',
            provider: 'world2'
        });

        socket.verify(o => o.close(), Times.Once());
    });

    it('should ping socket when opened', async () => {
        socket.setup(o => o.on(It.IsAny(), It.IsAny())).returns(socket.object());
        socket.setup(o => o.ping(It.IsAny())).returns(undefined);

        target.callback = () => socket.object();
        await target.open({
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
    
    it('should do nothing when no callback is set on error received', async () => {
        log.setup(o => o.error('UNEXPECTED_SOCKET_ERROR', It.IsAny())).returns(undefined);

        await expect(target.unsafeOnErrorReceived({
            error: 'error',
            message: 'error message',
            type: 'error type'
        })).resolves.toBeUndefined();
    });

    it('should log errors thrown when error callback is executed', async () => {
        log.setup(o => o.error('UNEXPECTED_SOCKET_ERROR', It.IsAny())).returns(undefined);
        log.setup(o => o.error('ERROR_HANDLING_ERROR_EVENT', It.IsAny())).returns(undefined);

        target.setOnErrorCallback(() => {
            throw new Error('Ouch');
        });

        await expect(target.unsafeOnErrorReceived({
            error: 'error',
            message: 'error message',
            type: 'error type'
        })).resolves.toBeUndefined();

        log.verify(o => o.error('ERROR_HANDLING_ERROR_EVENT', It.IsAny()), Times.Once());
    });

    it('should log errors thrown when disconnect callback is executed', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        target.unsafeSetConnected(true);
        target.setOnDisconnectedCallback(() => {
            throw new Error('Ouch');
        });

        await expect(target.unsafeOnCloseReceived()).resolves.toBeUndefined();

        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should handle unable to connect when closed before connected', async () => {        
        log.setup(o => o.debug(It.IsAny())).returns(undefined);   
        log.setup(o => o.info(It.IsAny())).returns(undefined);
        
        let disconnected = false;
        target.setOnDisconnectedCallback(() => {
            disconnected = true;

            return Promise.resolve(undefined);
        });

        target.unsafeOnConnecting();
        await expect(target.unsafeOnCloseReceived()).resolves.toBeUndefined();

        expect(target.isConnecting()).toBeFalsy();
        expect(target.isConnected()).toBeFalsy();

        // We don't want disconnected to fire when it never connected as this would cause constant reconnect attempts.
        expect(disconnected).toBeFalsy();

        log.verify(o => o.debug('DISCONNECTED'), Times.Once());
    });

    it('should handle errors thrown on connected event', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);   
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        target.setOnConnectedCallback(() => {
            throw new Error('Ouch');
        });

        await expect(target.unsafeOnConnectedReceived({
            ready: true,
            connectionId: '12345'
        })).resolves.toBeUndefined();

        log.verify(o => o.error(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should handle disconnected when closed after connected', async () => {     
        log.setup(o => o.debug(It.IsAny())).returns(undefined);   
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        let disconnected = false;
        target.setOnDisconnectedCallback(() => {
            disconnected = true;

            return Promise.resolve(undefined);
        });

        await expect(target.unsafeOnConnectedReceived({
            ready: true,
            connectionId: '12345'
        })).resolves.toBeUndefined();

        await expect(target.unsafeOnCloseReceived()).resolves.toBeUndefined();

        expect(target.isConnecting()).toBeFalsy();
        expect(target.isConnected()).toBeFalsy();
        expect(disconnected).toBeTruthy();

        log.verify(o => o.debug('DISCONNECTED'), Times.Once());
    });

    it('should handle when an error has been received', async () => {
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        const err: ErrorEvent = {
            error: 'hello',
            message: 'world',
            type: 'fake'
        };

        let handled = false;
        target.setOnErrorCallback(() => {
            handled = true;

            return Promise.resolve(undefined);
        });

        await expect(target.unsafeOnErrorReceived(err)).resolves.toBeUndefined();

        expect(handled).toBeTruthy();
    });

    it('should do nothing when not connected on close', () => {
        expect(() => target.close()).not.toThrow();
    });

    it('should terminate the connection when connected on close', async () => {
        socket.setup(o => o.on(It.IsAny(), It.IsAny())).returns(socket.object());
        socket.setup(o => o.terminate()).returns(undefined);

        target.callback = () => socket.object();

        await target.open({
            value: 'hello1',
            provider: 'world1'
        });

        await expect(target.close()).resolves.toBeUndefined();

        socket.verify(o => o.terminate(), Times.Once());
    });
    
    it('should set the callback', () => {
        target.setOnEventCallback(() => Promise.resolve(undefined));

        expect(target.isCallbackSet()).toBeTruthy();
    });

    it('should return when the buffer is empty', async () => {
        const payload = Buffer.from([]);

        await target.unsafeOnMessageReceived(payload);
    });

    it('should log an error when invalid json is received', async () => {
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        const payload = Buffer.from(' ');

        await expect(target.unsafeOnMessageReceived(payload)).resolves.toBeUndefined();

        log.verify(o => o.error('ERROR_PROCESSING_MESSAGE', It.IsAny()), Times.Once());
    });

    it('should handle the connected event', async () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const id = '12345';
        const event: ConnectedEvent = {
            ready: true,
            connectionId: id
        };

        let connected = false;
        target.setOnConnectedCallback(() => {
            connected = true;

            return Promise.resolve(undefined);
        });

        const payload = Buffer.from(JSON.stringify(event));

        await expect(target.unsafeOnMessageReceived(payload)).resolves.toBeUndefined();
        
        expect(target.isConnected()).toBeTruthy();
        expect(target.getConnectionId()).toBe(id);
        expect(connected).toBeTruthy();
    });

    it('should ignore the event when no type is provided', async () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        const payload = Buffer.from(JSON.stringify({ }));

        await target.unsafeOnMessageReceived(payload);
    });

    it('should ignore the mower event without a callback', async () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        const id = '12345';
        const event: AutomowerEvent = {
            id: id,
            type: AutomowerEventTypes.UNKNOWN
        };

        const payload = Buffer.from(JSON.stringify(event));

        await expect(target.unsafeOnMessageReceived(payload)).resolves.toBeUndefined();
    });

    it('should handle the mower event with a callback', async () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        const id = '12345';
        const event: AutomowerEvent = {
            id: id,
            type: AutomowerEventTypes.UNKNOWN
        };

        const payload = Buffer.from(JSON.stringify(event));
        let executed = false;

        target.setOnEventCallback((e1) => {
            expect(e1).toStrictEqual(event);

            executed = true;
            return Promise.resolve(undefined);
        });

        await expect(target.unsafeOnMessageReceived(payload)).resolves.toBeUndefined();

        expect(executed).toBeTruthy();
    });
});