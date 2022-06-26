import { AutomowerEvent, ErrorEvent } from '../../../src/events';
import { EventStreamServiceImpl } from '../../../src/services/automower/eventStreamService';

export class EventStreamServiceImplSpy extends EventStreamServiceImpl {
    public shouldRunKeepAlive = true;
    public keepAliveExecuted = false;

    public unsafeEventReceived(event: AutomowerEvent): Promise<void> {
        return this.onEventReceived(event);
    }

    public unsafeKeepAlive(): Promise<void> {
        return this.keepAlive();
    }    

    protected override keepAlive(): Promise<void> {
        this.keepAliveExecuted = true;

        if (this.shouldRunKeepAlive) {
            return super.keepAlive();
        }

        return Promise.resolve(undefined);
    }
    
    public unsafeSetLastEventReceived(value?: Date): void {
        this.setLastEventReceived(value);
    }

    public unsafeSetStarted(value?: Date): void {
        this.setStarted(value);
    }

    public unsafeOnConnectedEventReceived(): Promise<void> {
        return this.onConnectedEventReceived();
    }

    public unsafeOnDisconnectedEventReceived(): Promise<void> {
        return this.onDisconnectedEventReceived();
    }

    public unsafeOnErrorEventReceived(event: ErrorEvent): Promise<void> {
        return this.onErrorEventReceived(event);
    }

    public unsafeFlagAsKeepAliveActive() {
        this.flagAsKeepAliveActive();
    }

    public unsafeClearKeepAliveFlag() {
        this.clearKeepAliveFlag();
    }

    public unsafeIsKeepAliveActive(): boolean {
        return this.isKeepAliveActive();
    }
}