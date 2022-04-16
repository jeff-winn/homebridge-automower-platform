import { WebSocket } from 'ws';

import { AutomowerEventStream } from '../automowerEventStream';
import { AutomowerEvent } from '../events';
import { OAuthToken } from '../model';

export class AutomowerEventStreamImpl implements AutomowerEventStream {
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

    public isConnected(): boolean {
        return this.connected;
    }

    private onMessageReceived(data: Buffer): void {
        if (data.length === 0) {
            return;
        }

        const payload = JSON.parse(data.toString()) as AutomowerEvent;
        if (this.onMessageReceivedCallback !== undefined) {
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