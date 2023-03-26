import { PlatformLogger } from '../diagnostics/platformLogger';
import { AccessToken } from '../model';
import { WebSocketWrapper } from '../primitives/webSocketWrapper';

/**
 * A client which receives a stream of events for all mowers connected to the account.
 */
export interface EventStreamClient {
    /**
     * Identifies whether the stream is connected.
     */
    isConnected(): boolean;

    /**
     * Opens the stream.
     * @param token The token which will be used to authenticate.
     */
    open(token: AccessToken): Promise<void>;

    /**
     * Closes the stream.
     */
    close(): Promise<void>;

    /**
     * Executes the callback when the client is disconnected.
     * @param callback The callback to execute.
     */
    onDisconnected(callback: () => Promise<void>): void;

    /**
     * Executes the callback when the client has connected.
     * @param callback The callback to execute.
     */
    onConnected(callback: () => Promise<void>): void;    

    /**
     * Executes the callback when the client has encountered an error.
     * @param callback The callback to execute.
     */
    onError(callback: () => Promise<void>): void;

    /**
     * Pings the server.
     */
    ping(): void;
}

/**
 * An abstract {@link EventStreamClient} which provides base functionality for event stream client implementations.
 */
export abstract class AbstractEventStreamClient implements EventStreamClient {
    private socket?: WebSocketWrapper;

    private onErrorReceivedCallback?: () => void;
    private onConnectedCallback?: () => void;
    private onDisconnectedCallback?: () => void;
    private connecting = false;
    private connected = false;

    protected constructor(protected readonly log: PlatformLogger) { }

    public onConnected(callback: () => Promise<void>): void {
        this.onConnectedCallback = callback;
    }

    public onDisconnected(callback: () => Promise<void>): void {
        this.onDisconnectedCallback = callback;
    }

    public onError(callback: () => Promise<void>): void {
        this.onErrorReceivedCallback = callback;
    }

    public async open(token: AccessToken): Promise<void> {
        if (this.socket !== undefined) {
            this.socket.close();
        }

        this.onConnecting();
        this.socket = await this.createSocket(token);
    }

    protected onConnecting(): void {
        this.setConnecting(true);
    }

    protected abstract createSocket(token: AccessToken): Promise<WebSocketWrapper>;

    protected onConnectionSucceeded(): void {
        this.setConnecting(false);
        this.setConnected(true);
        
        this.notifyConnected();
    }

    private notifyConnected(): void {        
        if (this.onConnectedCallback !== undefined) {
            try {
                this.onConnectedCallback();
            } catch (e) {
                this.log.error('ERROR_HANDLING_CONNECTED_EVENT', e);
            }
        }
    }

    protected onCloseReceived() {
        if (this.isConnected()) {
            this.setConnected(false);
            this.notifyCloseReceived();
        } else if (this.connecting) {
            this.setConnecting(false);
        }        
    }    

    protected notifyCloseReceived(): void {
        if (this.onDisconnectedCallback !== undefined) {
            try {
                this.onDisconnectedCallback();                
            } catch (e) {
                this.log.error('ERROR_HANDLING_DISCONNECTED_EVENT', e);
            }
        }
    }
    
    protected notifyErrorReceived(): void {
        if (this.onErrorReceivedCallback !== undefined) {
            try {
                this.onErrorReceivedCallback();
            } catch (e) {
                this.log.error('ERROR_HANDLING_ERROR_EVENT', e);
            }
        }
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

    public close(): Promise<void> {
        if (this.socket !== undefined) {
            this.socket.terminate();
        }

        return Promise.resolve(undefined);
    }
}