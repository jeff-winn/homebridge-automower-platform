import { PlatformLogger } from '../diagnostics/platformLogger';
import { AutomowerEvent, ConnectedEvent, ErrorEvent } from '../events';
import { AccessToken } from '../model';
import { PLUGIN_ID } from '../settings';
import { WebSocketWrapper, WebSocketWrapperImpl } from './primitives/webSocketWrapper';

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
     * Executes the callback when the client is disconnected.
     * @param callback The callback to execute.
     */
    onDisconnected(callback: () => Promise<void>): void;

    /**
     * Executes the callback when the client has connected.
     * @param callback The callback to execute.
     */
    onConnected(callback: (event: ConnectedEvent) => Promise<void>): void;

    /**
     * Executes the callback when the client has encountered an error.
     * @param callback The callback to execute.
     */
    onError(callback: (event: ErrorEvent) => Promise<void>): void;

    /**
     * Pings the server.
     */
    ping(): void;
}

export class AutomowerEventStreamClientImpl implements AutomowerEventStreamClient {
    private socket?: WebSocketWrapper;
    private onMessageReceivedCallback?: (payload: AutomowerEvent) => void;

    private onErrorReceivedCallback?: (payload: ErrorEvent) => void;
    private onConnectedCallback?: (payload: ConnectedEvent) => void;
    private onDisconnectedCallback?: () => void;

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
        this.setConnecting(true);
    }

    protected createSocket(token: AccessToken): WebSocketWrapper {
        return new WebSocketWrapperImpl(this.baseUrl, {
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'X-Application-Id': PLUGIN_ID
            }
        });
    }

    public getConnectionId(): string | undefined {
        return this.connectionId;
    }

    protected setConnectionId(value: string | undefined) {
        this.connectionId = value;
    }

    public ping(): void {
        this.socket?.ping('ping');
    }

    public isConnected(): boolean {
        return this.connected;
    }

    protected setConnected(value: boolean): void {
        this.connected = value;
    }

    public isConnecting(): boolean {
        return this.connecting;
    }

    protected setConnecting(value: boolean): void {
        this.connecting = value;
    }

    public isCallbackSet(): boolean {
        return this.onMessageReceivedCallback !== undefined;
    }

    protected onCloseReceived() {
        if (this.isConnected()) {
            this.setConnected(false);

            if (this.onDisconnectedCallback !== undefined) {
                try {
                    this.onDisconnectedCallback();                
                } catch (e) {
                    this.log.error('An unexpected error occurred while handling the disconnected event.', e);
                }
            }
        } else if (this.connecting) {
            this.setConnecting(false);
        }        
    }
    
    protected onErrorReceived(err: ErrorEvent): void {
        if (this.onErrorReceivedCallback !== undefined) {
            try {
                this.onErrorReceivedCallback(err);
            } catch (e) {
                this.log.error('An unexpected error occurred while handling the error event.', e);
            }
        }
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
        this.setConnectionId(event.connectionId);
        this.setConnecting(false);
        this.setConnected(true);
        
        if (this.onConnectedCallback !== undefined) {
            try {
                this.onConnectedCallback(event);
            } catch (e) {
                this.log.error('An unexpected error occurred while handling the connected event.', e);
            }
        }
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

    public onConnected(callback: (event: ConnectedEvent) => Promise<void>): void {
        this.onConnectedCallback = callback;
    }

    public onDisconnected(callback: () => Promise<void>): void {
        this.onDisconnectedCallback = callback;
    }

    public onError(callback: (event: ErrorEvent) => Promise<void>): void {
        this.onErrorReceivedCallback = callback;
    }
}