import { PlatformLogger } from '../../diagnostics/platformLogger';
import { AccessToken } from '../../model';
import { WebSocketWrapper } from '../../primitives/webSocketWrapper';
import { AbstractEventStreamClient, EventStreamClient } from '../eventStreamClient';
import { DataItem, Error, GardenaClient } from './gardenaClient';

/**
 * A client which receives a stream of events for all mowers connected to the account.
 */
export interface GardenaEventStreamClient extends EventStreamClient {
    /**
     * Sets the callback to execute when an event is received.
     * @param callback The callback to execute.
     */
    setOnEventCallback(callback: (event: DataItem) => Promise<void>): void;
}

export class GardenaEventStreamClientImpl extends AbstractEventStreamClient implements GardenaEventStreamClient {
    private messageReceivedCallback?: (payload: DataItem) => Promise<void>;
    private firstMessageReceived = false;

    public constructor(private readonly locationId: string, private readonly client: GardenaClient, log: PlatformLogger) {
        super(log);
    }

    protected override onConnecting(): void {
        // If the client is being reused, when it connects the connected callback will need to be executed.
        this.firstMessageReceived = false;

        super.onConnecting();
    }

    protected async createSocket(token: AccessToken): Promise<WebSocketWrapper> {
        const response = await this.client.createSocket(this.locationId, token);
        
        const socket = this.createSocketCore(response.data.attributes.url, token);
        socket.on('message', this.onMessageReceivedCallback.bind(this));
        socket.on('error', this.onErrorReceived.bind(this));
        socket.on('close', this.onCloseReceived.bind(this));

        return socket;
    }

    protected onMessageReceivedCallback(buffer: Buffer): void {
        this.onMessageReceivedCallbackAsync(buffer).then()
            .catch(err => {
                this.log.error('ERROR_PROCESSING_MESSAGE', err);
            });
    }

    private async onMessageReceivedCallbackAsync(buffer: Buffer): Promise<void> {
        if (buffer.length === 0) {
            return;
        }

        const data = JSON.parse(buffer.toString());
        this.log.debug('RECEIVED_EVENT', JSON.stringify(data));

        if (!this.hasFirstMessageBeenReceived()) {
            // The first message has been received.
            await this.onFirstMessageReceived();
        }

        const mowerEvent = data as DataItem;
        if (mowerEvent.type !== undefined) {
            await this.notifyEventReceived(mowerEvent);
        }
    }

    private hasFirstMessageBeenReceived(): boolean {
        return this.firstMessageReceived;
    }

    protected async onFirstMessageReceived(): Promise<void> {
        await this.onConnected();
    
        this.flagAsFirstMessageReceived();
    }

    private flagAsFirstMessageReceived(): void {
        this.firstMessageReceived = true;
    }

    protected async onErrorReceived(err: Error): Promise<void> {
        this.log.error('UNEXPECTED_SOCKET_ERROR', {
            error: err.title,
            message: err.detail,
            type: err.code
        });

        await this.notifyErrorReceived();
    }

    public setOnEventCallback(callback: (event: DataItem) => Promise<void>): void {
        this.messageReceivedCallback = callback;
    }

    protected async notifyEventReceived(event: DataItem): Promise<void> {
        if (this.messageReceivedCallback !== undefined) {
            await this.messageReceivedCallback(event);
        }
    }
}