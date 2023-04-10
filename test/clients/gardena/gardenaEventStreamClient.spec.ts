import { It, Mock, Times } from 'moq.ts';

import { GardenaClient, ItemType } from '../../../src/clients/gardena/gardenaClient';
import { PlatformLogger } from '../../../src/diagnostics/platformLogger';
import { WebSocketWrapper } from '../../../src/primitives/webSocketWrapper';
import { GardenaEventStreamClientImplSpy } from './gardenaEventStreamClientImplSpy';
import { AccessToken } from '../../../src/model';

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
});