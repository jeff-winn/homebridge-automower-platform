import { PositionsEvent, SettingsEvent, StatusEvent } from '../../../clients/automower/automowerEventStreamClient';
import { EventStreamService } from '../eventStreamService';

export class GardenaEventStreamService implements EventStreamService {
    public onPositionsEventReceived(callback: (event: PositionsEvent) => Promise<void>): void {
        // TODO: This method intentionally left blank.
    }

    public onStatusEventReceived(callback: (event: StatusEvent) => Promise<void>): void {
        // TODO: This method intentionally left blank.
    }

    public onSettingsEventReceived(callback: (event: SettingsEvent) => Promise<void>): void {
        // TODO: This method intentionally left blank.
    }

    public start(): Promise<void> {
        // TODO: This method intentionally left blank.
        return Promise.resolve();
    }

    public stop(): Promise<void> {
        // TODO: This method intentionally left blank.
        return Promise.resolve();
    }
}