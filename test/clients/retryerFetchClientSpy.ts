import { RequestInfo, RequestInit, Response, RetryerFetchClient } from '../../src/clients/fetchClient';

export class RetryerFetchClientSpy extends RetryerFetchClient {
    public waited = false;
    public attempts = 0;

    public tooManyRequests = 0;
    public serviceUnavailable = 0;
    public responseCallback!: () => Response;
    
    protected override waitMilliseconds(ms: number): Promise<unknown> {
        this.waited = true;

        return Promise.resolve(undefined);
    }

    protected override doFetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
        this.attempts++;
        
        const response = this.responseCallback!();
        return Promise.resolve(response);        
    }

    protected override onTooManyRequests(): Promise<boolean> {
        this.tooManyRequests++;
        
        return super.onTooManyRequests();
    }

    protected override onServiceUnavailable(): Promise<boolean> {
        this.serviceUnavailable++;

        return super.onServiceUnavailable();
    }
}