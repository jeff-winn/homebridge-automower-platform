import { It, Mock, Times } from 'moq.ts';

import { DataItem, GardenaClient, ItemType } from '../../../src/clients/gardena/gardenaClient';
import { PlatformLogger } from '../../../src/diagnostics/platformLogger';
import { AccessToken } from '../../../src/model';
import { WebSocketWrapper } from '../../../src/primitives/webSocketWrapper';
import { GardenaEventStreamClientImplSpy } from './gardenaEventStreamClientImplSpy';

describe('GardenaEventStreamClientImpl', () => {
    let socket: Mock<WebSocketWrapper>;
    let locationId: string;
    let client: Mock<GardenaClient>;
    let log: Mock<PlatformLogger>;
    
    let target: GardenaEventStreamClientImplSpy;

    beforeEach(() => {
        socket = new Mock<WebSocketWrapper>();
        locationId = '12345';
        client = new Mock<GardenaClient>();
        log = new Mock<PlatformLogger>();

        target = new GardenaEventStreamClientImplSpy(locationId, client.object(), log.object());
    });

    it('should open the socket and connect all events', async () => {
        log.setup(o => o.debug('OPENING_CONNECTION')).returns(undefined);
        socket.setup(o => o.on(It.IsAny(), It.IsAny())).returns(socket.object());

        const token: AccessToken = {
            provider: 'hello',
            value: 'world'
        };

        client.setup(o => o.createSocket(locationId, token)).returnsAsync({
            data: {
                id: locationId,
                type: ItemType.WEBSOCKET,
                attributes: {
                    url: 'wss://ws-iapi.smart.gardena.dev/v1?auth=helloWorld',
                    validity: 10
                }
            }
        });

        target.callback = () => socket.object();

        await expect(target.open(token)).resolves.toBeUndefined();
        
        expect(target.isConnecting()).toBeTruthy();
        
        socket.verify(o => o.on('message', It.IsAny()), Times.Once());
        socket.verify(o => o.on('error', It.IsAny()), Times.Once());
        socket.verify(o => o.on('close', It.IsAny()), Times.Once());
    });

    it('should close the socket when being reopened', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);

        const token1: AccessToken = {
            value: 'hello1',
            provider: 'world1'
        };

        const token2: AccessToken = {
            value: 'hello2',
            provider: 'world2'
        };

        client.setup(o => o.createSocket(locationId, token1)).returnsAsync({
            data: {
                id: locationId,
                type: ItemType.WEBSOCKET,
                attributes: {
                    url: 'wss://ws-iapi.smart.gardena.dev/v1?auth=helloWorld-1',
                    validity: 10
                }
            }
        });

        client.setup(o => o.createSocket(locationId, token2)).returnsAsync({
            data: {
                id: locationId,
                type: ItemType.WEBSOCKET,
                attributes: {
                    url: 'wss://ws-iapi.smart.gardena.dev/v1?auth=helloWorld-2',
                    validity: 10
                }
            }
        });

        socket.setup(o => o.on(It.IsAny(), It.IsAny())).returns(socket.object());
        socket.setup(o => o.close()).returns(undefined);

        const socket2 = new Mock<WebSocketWrapper>();
        socket2.setup(o => o.on(It.IsAny(), It.IsAny())).returns(socket2.object());

        let attempt = 0;
        target.callback = () => {
            attempt++;

            if (attempt === 1) {
                return socket.object();
            } else {
                return socket2.object();
            }
        };

        await expect(target.open(token1)).resolves.toBeUndefined();
        await expect(target.open(token2)).resolves.toBeUndefined();

        socket.verify(o => o.close(), Times.Once());
    });

    it('should ping socket when opened', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);

        const token: AccessToken = {
            provider: 'hello',
            value: 'world'
        };

        client.setup(o => o.createSocket(locationId, token)).returnsAsync({
            data: {
                id: locationId,
                type: ItemType.WEBSOCKET,
                attributes: {
                    url: 'wss://ws-iapi.smart.gardena.dev/v1?auth=helloWorld',
                    validity: 10
                }
            }
        });

        socket.setup(o => o.on(It.IsAny(), It.IsAny())).returns(socket.object());
        socket.setup(o => o.ping(It.IsAny())).returns(undefined);

        target.callback = () => socket.object();
        await expect(target.open(token)).resolves.toBeUndefined();

        target.ping();

        socket.verify(o => o.ping('ping'), Times.Once());
    });

    it('should not throw an error when ping without being opened', () => {
        expect(() => target.ping()).not.toThrow();
    });

    it('should return false when not connected', () => {
        expect(target.isConnected()).toBeFalsy();
    });

    it('should do nothing when no callback is set on error received', async () => {
        log.setup(o => o.error('UNEXPECTED_SOCKET_ERROR', It.IsAny())).returns(undefined);

        target.unsafeOnErrorReceivedCallback({
            code: 'hello',
            detail: 'world',
            id: '12345',
            status: 'status',
            title: 'title'
        });

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);
    });

    it('should log errors thrown when error callback is executed', async () => {
        log.setup(o => o.error('UNEXPECTED_SOCKET_ERROR', It.IsAny())).returns(undefined);
        log.setup(o => o.error('ERROR_HANDLING_ERROR_EVENT', It.IsAny())).returns(undefined);

        target.setOnErrorCallback(() => {
            throw new Error('Ouch');
        });

        target.unsafeOnErrorReceivedCallback({
            code: 'hello',
            detail: 'world',
            id: '12345',
            status: 'status',
            title: 'title'
        });

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);

        log.verify(o => o.error('ERROR_HANDLING_ERROR_EVENT', It.IsAny()), Times.Once());
    });

    it('should log errors thrown when disconnect callback is executed', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        target.unsafeSetConnected(true);
        target.setOnDisconnectedCallback(() => {
            throw new Error('Ouch');
        });

        target.unsafeOnCloseReceivedCallback();

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);

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
        target.unsafeOnCloseReceivedCallback();

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);

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

        await expect(target.unsafeOnFirstMessageReceivedAsync()).resolves.toBeUndefined();

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

        await expect(target.unsafeOnFirstMessageReceivedAsync()).resolves.toBeUndefined();
        target.unsafeOnCloseReceivedCallback();

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);

        expect(target.isConnecting()).toBeFalsy();
        expect(target.isConnected()).toBeFalsy();
        expect(disconnected).toBeTruthy();

        log.verify(o => o.debug('DISCONNECTED'), Times.Once());
    });

    it('should handle when an error has been received', async () => {
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        let handled = false;
        target.setOnErrorCallback(() => {
            handled = true;

            return Promise.resolve(undefined);
        });

        target.unsafeOnErrorReceivedCallback({
            code: 'code',
            detail: 'detail',
            id: '12345',
            status: 'status',
            title: 'title'
        });

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);

        expect(handled).toBeTruthy();
    });

    it('should do nothing when not connected on close', () => {
        expect(() => target.close()).not.toThrow();
    });

    it('should terminate the connection when connected on close', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);

        const token: AccessToken = {
            provider: 'hello',
            value: 'world'
        };

        client.setup(o => o.createSocket(locationId, token)).returnsAsync({
            data: {
                id: locationId,
                type: ItemType.WEBSOCKET,
                attributes: {
                    url: 'wss://ws-iapi.smart.gardena.dev/v1?auth=helloWorld',
                    validity: 10
                }
            }
        });

        socket.setup(o => o.on(It.IsAny(), It.IsAny())).returns(socket.object());
        socket.setup(o => o.terminate()).returns(undefined);

        target.callback = () => socket.object();

        await expect(target.open(token)).resolves.toBeUndefined();
        await expect(target.close()).resolves.toBeUndefined();

        socket.verify(o => o.terminate(), Times.Once());
    });

    it('should return when the buffer is empty', async () => {
        const payload = Buffer.from([]);

        target.unsafeOnMessageReceivedCallback(payload);

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);
    });

    it('should log an error when invalid json is received', async () => {
        log.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        const payload = Buffer.from(' ');

        target.unsafeOnMessageReceivedCallback(payload);

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);

        log.verify(o => o.error('ERROR_PROCESSING_MESSAGE', It.IsAny()), Times.Once());
    });

    it('should ignore the event when no type is provided', async () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        const payload = Buffer.from(JSON.stringify({ }));

        target.unsafeOnMessageReceivedCallback(payload);

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);
    });

    it('should ignore the mower event without a callback', async () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        const id = '12345';
        const event: DataItem = {
            id: id,
            type: ItemType.MOWER
        };

        const payload = Buffer.from(JSON.stringify(event));

        target.unsafeOnMessageReceivedCallback(payload);

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);
    });

    it('should handle the mower event with a callback', async () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        const id = '12345';
        const event: DataItem = {
            id: id,
            type: ItemType.MOWER
        };

        const payload = Buffer.from(JSON.stringify(event));
        let executed = false;

        target.setOnEventCallback((e1) => {
            expect(e1).toStrictEqual(event);

            executed = true;
            return Promise.resolve(undefined);
        });

        target.unsafeOnMessageReceivedCallback(payload);

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);

        expect(executed).toBeTruthy();
    });
});