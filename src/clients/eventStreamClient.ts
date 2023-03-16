import { AccessToken } from '../model';

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
    open(token: AccessToken): void;

    /**
     * Closes the stream.
     */
    close(): void;

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