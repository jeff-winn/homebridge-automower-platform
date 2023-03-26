import { PlatformLogger } from '../../diagnostics/platformLogger';
import { AccessToken } from '../../model';
import { WebSocketWrapper, WebSocketWrapperImpl } from '../../primitives/webSocketWrapper';
import { PLUGIN_ID } from '../../settings';
import { AbstractEventStreamClient, EventStreamClient } from '../eventStreamClient';
import { DataItem, Error, GardenaClient } from './gardenaClient';

/**
 * A client which receives a stream of events for all mowers connected to the account.
 */
export interface GardenaEventStreamClient extends EventStreamClient {
    /**
     * Executes the callback when an event is received.
     * @param callback The callback to execute.
     */
    on(callback: (event: DataItem) => Promise<void>): void;
}

export class GardenaEventStreamClientImpl extends AbstractEventStreamClient implements GardenaEventStreamClient {
    private onMessageReceivedCallback?: (payload: DataItem) => Promise<void>;

    public constructor(private readonly locationId: string, private readonly client: GardenaClient, log: PlatformLogger) {
        super(log);
    }

    protected async createSocket(token: AccessToken): Promise<WebSocketWrapper> {
        const response = await this.client.createSocket(this.locationId, token);
        
        const socket = new WebSocketWrapperImpl(response.data.attributes.url, {
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'X-Application-Id': PLUGIN_ID
            }
        });

        socket.on('message', this.onSocketMessageReceived.bind(this));
        socket.on('error', this.onErrorReceived.bind(this));
        socket.on('close', this.onCloseReceived.bind(this));

        return socket;
    }

    protected onSocketMessageReceived(buffer: Buffer): void {
        if (buffer.length === 0) {
            return;
        }

        try {
            const data = JSON.parse(buffer.toString());
            this.log.debug('RECEIVED_EVENT', JSON.stringify(data));

            const mowerEvent = data as DataItem;
            if (mowerEvent.type !== undefined) {
                this.notifyEventReceived(mowerEvent);
            }
        } catch (e) {
            this.log.error('ERROR_PROCESSING_MESSAGE', e);
        }
    }

    protected onErrorReceived(err: Error): void {
        this.log.error('UNEXPECTED_SOCKET_ERROR', {
            error: err.title,
            message: err.detail,
            type: err.code
        });

        this.notifyErrorReceived();
    }

    public on(callback: (event: DataItem) => Promise<void>): void {
        this.onMessageReceivedCallback = callback;
    }

    protected notifyEventReceived(event: DataItem): void {
        if (this.onMessageReceivedCallback !== undefined) {
            this.onMessageReceivedCallback(event);
        }
    }
}