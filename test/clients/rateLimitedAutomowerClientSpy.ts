import { RateLimitedAutomowerClient } from '../../src/clients/rateLimitedAutomowerClient';

export class RateLimitedAutomowerClientSpy extends RateLimitedAutomowerClient {
    public waited = false;

    protected override wait(): Promise<void> {
        this.waited = true;

        return Promise.resolve(undefined);
    }

    public unsafeCalculateRateLimitationDelay(now: Date): number {
        return this.calculateRateLimitationDelay(now);
    }

    public unsafeSetLastAccessed(value: Date | undefined): void {
        this.setLastAccessed(value);
    }
}