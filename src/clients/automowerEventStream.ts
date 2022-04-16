import { AutomowerEvent } from './events';
import { OAuthToken } from './model';

/**
 * A client which receives a stream of events for all mowers connected to the account.
 */
export interface AutomowerEventStream {
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
     * Executes the callback when the event type is received.
     * @param eventType The type of event.
     * @param callback The callback to execute.
     */
    on(callback: (event: AutomowerEvent) => Promise<void>): void;
}