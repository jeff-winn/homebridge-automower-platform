import { PositionsEvent, SettingsEvent, StatusEvent } from '../../../clients/automower/automowerEventStreamClient';
import { EventStreamService } from '../eventStreamService';

export class GardenaEventStreamService implements EventStreamService {
    public onPositionsEventReceived(callback: (event: PositionsEvent) => Promise<void>): void {
        // TODO: This method needs to be implemented.
    }

    public onStatusEventReceived(callback: (event: StatusEvent) => Promise<void>): void {
        // TODO: This method needs to be implemented.
    }

    public onSettingsEventReceived(callback: (event: SettingsEvent) => Promise<void>): void {
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