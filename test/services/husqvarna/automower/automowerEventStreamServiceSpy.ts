import { AutomowerEvent } from '../../../../src/clients/automower/automowerEventStreamClient';
import { AutomowerEventStreamService } from '../../../../src/services/husqvarna/automower/automowerEventStreamService';

export class AutomowerEventStreamServiceSpy extends AutomowerEventStreamService {
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

    public unsafeGetLastEventReceived(): Date | undefined {
        return this.getLastEventReceived();
    }
    
    public unsafeSetLastEventReceived(value?: Date): void {
        this.setLastEventReceived(value);
    }

    public unsafeGetStarted(): Date | undefined {
        return this.getStarted();
    }

    public unsafeSetStarted(value?: Date): void {
        this.setStarted(value);
    }    

    public unsafeOnCheckKeepAliveAsync(): Promise<void> {
        return this.onCheckKeepAliveAsync();
    }

    public unsafeOnDisconnectedEventReceived(): Promise<void> {
        return this.onDisconnectedEventReceived();
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

    public unsafeFlagAsStopping(): void {
        this.flagAsStopping();
    }

    public unsafeHasStopped(): boolean {
        return this.hasStopped();
    }

    public unsafeIsStopping(): boolean {
        return this.isStopping();
    }
}