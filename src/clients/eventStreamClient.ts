import { PlatformLogger } from '../diagnostics/platformLogger';
import { AccessToken } from '../model';
import { WebSocketWrapper, WebSocketWrapperImpl } from '../primitives/webSocketWrapper';
import { PLUGIN_ID } from '../settings';

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
    openAsync(token: AccessToken): Promise<void>;

    /**
     * Closes the stream.
     */
    closeAsync(): Promise<void>;

    /**
     * Sets the callback to execute when the client is disconnected.
     * @param callback The callback to execute.
     */
    setOnDisconnectedCallback(callback: () => Promise<void>): void;

    /**
     * Sets the callback to execute when the client has connected.
     * @param callback The callback to execute.
     */
    setOnConnectedCallback(callback: () => Promise<void>): void;    

    /**
     * Sets the callback to execute when the client has encountered an error.
     * @param callback The callback to execute.
     */
    setOnErrorCallback(callback: () => Promise<void>): void;

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

    private errorReceivedCallback?: () => Promise<void>;
    private connectedCallback?: () => Promise<void>;
    private disconnectedCallback?: () => Promise<void>;
    private connecting = false;
    private connected = false;

    protected constructor(protected readonly log: PlatformLogger) { }

    public setOnConnectedCallback(callback: () => Promise<void>): void {
        this.connectedCallback = callback;
    }

    public setOnDisconnectedCallback(callback: () => Promise<void>): void {
        this.disconnectedCallback = callback;
    }

    public setOnErrorCallback(callback: () => Promise<void>): void {
        this.errorReceivedCallback = callback;
    }

    public async openAsync(token: AccessToken): Promise<void> {
        if (this.socket !== undefined) {
            this.socket.close();
        }

        this.log.debug('OPENING_CONNECTION');
        
        this.onConnecting();
        this.socket = await this.createSocket(token);
    }

    protected onConnecting(): void {
        this.setConnecting(true);
    }

    protected abstract createSocket(token: AccessToken): Promise<WebSocketWrapper>;

    protected createSocketCore(url: string, token: AccessToken): WebSocketWrapper {
        return new WebSocketWrapperImpl(url, {
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'X-Application-Id': PLUGIN_ID
            }
        });
    }

    protected async onConnectedAsync(): Promise<void> {
        this.log.debug('CONNECTED');

        this.setConnecting(false);
        this.setConnected(true);
        
        await this.notifyConnectedAsync();
    }

    protected async notifyConnectedAsync(): Promise<void> {        
        if (this.connectedCallback !== undefined) {
            await this.connectedCallback();
        }
    }

    protected onCloseReceivedCallback(): void {
        this.onCloseReceivedCallbackAsync().then()
            .catch(err => {
                this.log.error('ERROR_HANDLING_DISCONNECTED_EVENT', err);
            });
    }

    private async onCloseReceivedCallbackAsync(): Promise<void> {
        this.log.debug('DISCONNECTED');
        
        if (this.isConnected()) {
            this.setConnected(false);
            await this.notifyDisconnectedAsync();
        } else if (this.connecting) {
            this.setConnecting(false);
        }        
    }    

    protected async notifyDisconnectedAsync(): Promise<void> {
        if (this.disconnectedCallback !== undefined) {
            await this.disconnectedCallback();
        }
    }
    
    protected async notifyErrorReceivedAsync(): Promise<void> {
        if (this.errorReceivedCallback !== undefined) {
            await this.errorReceivedCallback();            
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

    public closeAsync(): Promise<void> {
        if (this.socket !== undefined) {
            this.socket.terminate();
        }

        return Promise.resolve(undefined);
    }
}