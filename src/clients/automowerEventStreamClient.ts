import { WebSocket } from 'ws';
import { AutomowerEvent } from './events';
import { OAuthToken } from './model';

/**
 * A client which receives a stream of events for all mowers connected to the account.
 */
export interface AutomowerEventStreamClient {
    /**
     * Opens the stream.
     * @param token The token which will be used to authenticate.
     */
    open(token: OAuthToken): void;

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
    private socket?: WebSocket;
    private onMessageReceivedCallback?: (payload: AutomowerEvent) => void;

    private connected = false;

    constructor(private baseUrl: string) { }
    
    public open(token: OAuthToken): void {
        this.socket = new WebSocket(this.baseUrl, {
            headers: {
                'Authorization': `Bearer ${token.access_token}`
            }
        });
        
        this.socket.on('message', this.onMessageReceived.bind(this));
        this.socket.on('open', () => {
            this.connected = true;
        });

        this.socket.on('close', () => {
            this.connected = false;
        });
    }

    public ping(): void {
        this.socket?.ping('ping');
    }

    public isConnected(): boolean {
        return this.connected;
    }

    private onMessageReceived(data: Buffer): void {
        if (data.length === 0) {
            return;
        }

        const payload = JSON.parse(data.toString()) as AutomowerEvent;
        if (this.onMessageReceivedCallback !== undefined && payload.type !== undefined) {
            this.onMessageReceivedCallback(payload);
        }
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