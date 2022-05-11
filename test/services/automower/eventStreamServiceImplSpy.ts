import { EventStreamServiceImpl } from '../../../src/services/automower/eventStreamService';
import { AutomowerEvent } from '../../../src/events';

export class EventStreamServiceImplSpy extends EventStreamServiceImpl {
    public unsafeEventReceived(event: AutomowerEvent): Promise<void> {
        return this.onEventReceived(event);
    }

    public unsafeKeepAlive(): Promise<void> {
        return this.keepAlive();
    }
    
    public unsafeSetLastEventReceived(value?: Date): void {
        this.setLastEventReceived(value);
    }

    public unsafeSetStarted(value?: Date): void {
        this.setStarted(value);
    }
}