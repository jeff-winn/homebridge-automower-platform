import { Logging } from 'homebridge';
import { WebSocket } from 'ws';
import { AutomowerEvent, ConnectedEvent } from '../events';
import { AccessToken } from '../model';

/**
 * A client which receives a stream of events for all mowers connected to the account.
 */
export interface AutomowerEventStreamClient {
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
    private socket?: WebSocket;
    private onMessageReceivedCallback?: (payload: AutomowerEvent) => void;

    private connected = false;
    private connectionId?: string;

    constructor(private baseUrl: string, private log: Logging) { }
    
    public open(token: AccessToken): void {
        this.socket = new WebSocket(this.baseUrl, {
            headers: {
                'Authorization': `Bearer ${token.value}`
            }
        });
        
        this.socket.on('message', this.onMessageReceived.bind(this));
        this.socket.on('close', () => {
            this.log.info('Disconnected!');
            this.connected = false;
        });
    }

    public ping(): void {
        this.socket?.ping('ping');
    }

    public isConnected(): boolean {
        return this.connected;
    }

    private onMessageReceived(buffer: Buffer): void {
        if (buffer.length === 0) {
            return;
        }

        const data = JSON.parse(buffer.toString());
        this.log.debug('Received message:\r\n', JSON.stringify(data));

        const connectedEvent = data as ConnectedEvent;
        if (connectedEvent !== undefined && connectedEvent.connectionId !== undefined) {
            this.connectionId = connectedEvent.connectionId;
            this.connected = true;

            this.log.debug(`Established connection id: ${this.connectionId}`);
            this.log.info('Connected!');
        } else {
            const mowerEvent = data as AutomowerEvent;
            if (this.onMessageReceivedCallback !== undefined && mowerEvent.type !== undefined) {
                this.onMessageReceivedCallback(mowerEvent);
            }
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