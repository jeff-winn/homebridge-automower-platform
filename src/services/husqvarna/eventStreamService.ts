import { MowerSettingsChangedEvent, MowerStatusChangedEvent } from '../../events';

/**
 * A mechanism which is capable of streaming events for the Husqvarna account.
 */
export interface EventStreamService {
    /**
     * Occurs when a {@link StatusEvent} has been received.
     * @param callback The callback to execute.
     */
    onStatusEventReceived(callback: (event: MowerStatusChangedEvent) => Promise<void>): void;
    
    /**
     * Occurs when a {@link SettingsEvent} has been received.
     * @param callback The callback to execute.
     */
    onSettingsEventReceived(callback: (event: MowerSettingsChangedEvent) => Promise<void>): void;

    /**
     * Starts streaming events.
     */
    start(): Promise<void>;
    
    /**
     * Stops streaming events.
     */
    stop(): Promise<void>;
}