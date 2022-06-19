import { PlatformLogger } from '../diagnostics/platformLogger';
import { AutomowerEvent, ConnectedEvent } from '../events';
import { AccessToken } from '../model';
import { WebSocketWrapper, ErrorEvent, WebSocketWrapperImpl } from './primitives/webSocketWrapper';

/**
 * A client which receives a stream of events for all mowers connected to the account.
 */
export interface AutomowerEventStreamClient {
    /**
     * Identifies whether the stream is connected.
     */
    isConnected(): boolean;

    /**
     * Opens the stream.
     * @param token The token which will be used to authenticate.
     */
    open(token: AccessToken): void;

    /**
     * Closes the stream.
     */
    close(): void;

    /**
     * Executes the callback when an event is received.
     * @param callback The callback to execute.
     */
    on(callback: (event: AutomowerEvent) => Promise<void>): void;

    /**
     * Pings the server.
     */
    ping(): void;
}

export class AutomowerEventStreamClientImpl implements AutomowerEventStreamClient {
    private socket?: WebSocketWrapper;
    private onMessageReceivedCallback?: (payload: AutomowerEvent) => void;

    private connecting = false;
    private connected = false;
    private connectionId?: string;
    
    public constructor(private baseUrl: string, private log: PlatformLogger) { }
    
    public open(token: AccessToken): void {
        if (this.socket !== undefined) {
            this.socket.close();
        }

        this.onConnecting();        
        this.socket = this.createSocket(token);
        
        this.socket.on('message', this.onSocketMessageReceived.bind(this));
        this.socket.on('error', this.onErrorReceived.bind(this));    
        this.socket.on('close', this.onCloseReceived.bind(this));
    }

    protected onConnecting(): void {
        this.connecting = true;
    }

    protected createSocket(token: AccessToken): WebSocketWrapper {
        return new WebSocketWrapperImpl(this.baseUrl, {
            headers: {
                'Authorization': `Bearer ${token.value}`
            }
        });
    }

    public getConnectionId(): string | undefined {
        return this.connectionId;
    }

    public ping(): void {
        this.socket?.ping('ping');
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public isConnecting(): boolean {
        return this.connecting;
    }

    public isCallbackSet(): boolean {
        return this.onMessageReceivedCallback !== undefined;
    }

    protected onCloseReceived() {
        if (this.connected) {
            this.log.info('Disconnected!');
        } else if (this.connecting) {
            this.log.info('Unable to connect!');
        }

        this.connecting = false;
        this.connected = false;
    }
    
    protected onErrorReceived(err: ErrorEvent): void {
        this.log.error('An error occurred within the socket stream, see the following for additional details:\n', {
            error: err.error,
            message: err.message,
            type: err.type
        });
    }

    protected onSocketMessageReceived(buffer: Buffer): void {
        if (buffer.length === 0) {
            return;
        }

        try {
            const data = JSON.parse(buffer.toString());
            this.log.debug('Received event:\r\n', JSON.stringify(data));
    
            const connectedEvent = data as ConnectedEvent;
            if (connectedEvent.connectionId !== undefined) {
                this.onConnectedReceived(connectedEvent);
            } else {
                const mowerEvent = data as AutomowerEvent;
                if (mowerEvent.type !== undefined) {
                    this.onMessageReceived(mowerEvent);
                }
            }
        } catch (e) {
            this.log.error('An unexpected error occurred while processing the message.', e);
        }
    }

    protected onConnectedReceived(event: ConnectedEvent): void {
        this.connectionId = event.connectionId;
        this.connecting = false;
        this.connected = true;
        
        this.log.info('Connected!');
    }

    protected onMessageReceived(event: AutomowerEvent): void {
        if (this.onMessageReceivedCallback === undefined) {
            return;
        }

        this.onMessageReceivedCallback(event);
    }

    public close(): void {
        if (this.socket === undefined) {
            return;
        }

        this.socket.terminate();
    }

    public on(callback: (event: AutomowerEvent) => Promise<void>): void {        
        this.onMessageReceivedCallback = callback;
    }
}