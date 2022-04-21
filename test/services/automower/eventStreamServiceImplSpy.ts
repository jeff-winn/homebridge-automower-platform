import { EventStreamServiceImpl } from '../../../src/services/automower/eventStreamService';
import { AutomowerEvent } from '../../../src/clients/events';

export class EventStreamServiceImplSpy extends EventStreamServiceImpl {
    unsafeEventReceived(event: AutomowerEvent): Promise<void> {
        return this.onEventReceived(event);
    }

    unsafeKeepAlive(): Promise<void> {
        return this.keepAlive();
    }
    
    unsafeSetLastEventReceived(value?: Date): void {
        this.setLastEventReceived(value);
    }

    unsafeSetStarted(value?: Date): void {
        this.setStarted(value);
    }
}