import { MowerSettingsChangedEvent, MowerStatusChangedEvent } from '../../../events';
import { EventStreamService } from '../eventStreamService';

export class GardenaEventStreamService implements EventStreamService {
    public onStatusEventReceived(callback: (event: MowerStatusChangedEvent) => Promise<void>): void {
        // TODO: This method needs to be implemented.
    }

    public onSettingsEventReceived(callback: (event: MowerSettingsChangedEvent) => Promise<void>): void {
        // TODO: This method needs to be implemented.
    }

    public start(): Promise<void> {
        // TODO: This method needs to be implemented.
        return Promise.resolve();
    }

    public stop(): Promise<void> {
        // TODO: This method needs to be implemented.
        return Promise.resolve();
    }
}