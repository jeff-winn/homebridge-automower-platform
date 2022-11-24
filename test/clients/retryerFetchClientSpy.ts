import { Response, RetryerFetchClient } from '../../src/clients/fetchClient';

export class RetryerFetchClientSpy extends RetryerFetchClient {
    public waited = false;
    public attempts = 0;

    public tooManyRequests = 0;
    public serviceUnavailable = 0;
    public responseCallback!: () => Response;
    
    protected override wait(): Promise<void> {
        this.waited = true;

        return Promise.resolve(undefined);
    }

    public unsafeWait(ms: number): Promise<void> {
        return super.wait(ms);
    }

    protected override doFetch(): Promise<Response> {
        this.attempts++;
        
        const response = this.responseCallback!();
        return Promise.resolve(response);        
    }

    protected override onTooManyRequests(attempt: number): Promise<boolean> {
        this.tooManyRequests++;
        
        return super.onTooManyRequests(attempt);
    }

    protected override onServiceUnavailable(): Promise<boolean> {
        this.serviceUnavailable++;

        return super.onServiceUnavailable();
    }
}