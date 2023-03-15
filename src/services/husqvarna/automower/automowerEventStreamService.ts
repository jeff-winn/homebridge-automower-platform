import {
    AutomowerEvent, AutomowerEventStreamClient, AutomowerEventTypes, SettingsEvent, StatusEvent
} from '../../../clients/automower/automowerEventStreamClient';
import { AbstractEventStreamService } from '../eventStreamService';

export class AutomowerEventStreamService extends AbstractEventStreamService<AutomowerEventStreamClient> {
    protected attachTo(stream: AutomowerEventStreamClient): void {
        stream.on(this.onEventReceived.bind(this));
    }
    
    protected onEventReceived(event: AutomowerEvent): Promise<void> {
        this.setLastEventReceived(new Date());

        switch (event.type) {
            case AutomowerEventTypes.POSITIONS:
                return Promise.resolve(undefined); // Ignore the event.

            case AutomowerEventTypes.SETTINGS:
                return this.onSettingsEvent(event as SettingsEvent);

            case AutomowerEventTypes.STATUS:
                return this.onStatusEvent(event as StatusEvent);        

            default:
                this.log.warn('RECEIVED_UNKNOWN_EVENT', event.type);
                return Promise.resolve(undefined);
        }
    }    

    protected onSettingsEvent(event: SettingsEvent): Promise<void> {
        // TODO: Fix this.        
        return Promise.resolve(undefined);
    }

    protected onStatusEvent(event: StatusEvent): Promise<void> {
        // TODO: Fix this.
        return Promise.resolve(undefined);
    }
}