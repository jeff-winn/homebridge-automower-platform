/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientRequestArgs } from 'http';
import { WebSocket, ClientOptions } from 'ws';

/**
 * A mechanism which wraps a {@link WebSocket} implementation.
 */
export interface WebSocketWrapper {
    close(code?: number, data?: string | Buffer): void;

    terminate(): void;

    ping(data?: any, mask?: boolean, cb?: (err: Error) => void): void;

    on(event: string | symbol, listener: (this: WebSocket, ...args: any[]) => void): WebSocketWrapper;
}

export class WebSocketWrapperImpl implements WebSocketWrapper {
    private readonly socket: WebSocket;

    public constructor(address: string | URL, options?: ClientOptions | ClientRequestArgs) { 
        this.socket = new WebSocket(address, options);
    }

    public terminate(): void {
        this.socket.terminate();
    }

    public ping(data?: any, mask?: boolean, cb?: (err: Error) => void) {
        this.socket.ping(data, mask, cb);
    }

    public close(code?: number, data?: string | Buffer): void {
        this.socket.close(code, data);
    }

    public on(event: string | symbol, listener: (this: WebSocket, ...args: any[]) => void): WebSocketWrapper {
        this.socket.on(event, listener);
        return this;
    }
}