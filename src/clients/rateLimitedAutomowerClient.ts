import { AccessToken, Mower } from '../model';
import { AutomowerClientImpl } from './automowerClient';

/**
 * The duration that must occur in between calls.
 */
const RATE_LIMIT_DURATION = 1000; // Max 1 request per second.

/**
 * An {@link AutomowerClient} which performs rate limiting between outgoing calls to the web service.
 */
export class RateLimitedAutomowerClient extends AutomowerClientImpl {
    private lastAccessed?: Date;

    public override async doAction(id: string, action: unknown, token: AccessToken): Promise<void> {
        await this.guardMustNotExceedRateLimits();

        return await super.doAction(id, action, token);        
    }

    public override async getMower(id: string, token: AccessToken): Promise<Mower | undefined> {
        await this.guardMustNotExceedRateLimits();

        return await super.getMower(id, token);
    }

    public override async getMowers(token: AccessToken): Promise<Mower[]> {
        await this.guardMustNotExceedRateLimits();
        
        return await super.getMowers(token);
    }

    private async guardMustNotExceedRateLimits(): Promise<void> {
        const now = new Date();

        const delay = this.calculateRateLimitationDelay(now);
        if (delay > 0) {
            // The client has exceeded the rate limitation and a delay be enforced before continuation.
            await this.wait(delay);
        }        

        this.setLastAccessed(now);
    }

    /**
     * Sets the date when the client was last accessed.
     * @param value Optional. The value to set.
     */
    protected setLastAccessed(value: Date | undefined): void {
        this.lastAccessed = value;
    }

    /**
     * Calculates the delay for the rate limitation.
     * @param now The date from which the calculation should be applied.
     * @returns The amount of time (in milliseconds) that should be delayed.
     */
    protected calculateRateLimitationDelay(now: Date): number {
        if (this.lastAccessed !== undefined) {
            const diff = now.valueOf() - this.lastAccessed.valueOf();
            if (diff < RATE_LIMIT_DURATION) {
                // Calculate how much time is left before the limit has been reached.
                return RATE_LIMIT_DURATION - diff;
            }
        }

        return -1;
    }

    /**
     * Delays the execution.
     * @param ms The amount of time (in milliseconds) to delay.
     */
    protected async wait(ms: number): Promise<void> {
        await new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}