import fetch, { Headers, HeadersInit, RequestInfo, RequestInit, Response } from 'node-fetch';
import { v4 as uuid } from 'uuid';

import { PlatformLogger } from '../diagnostics/platformLogger';
export { RequestInfo, RequestInit, Response } from 'node-fetch';

/**
 * An node fetch client.
 */
export interface FetchClient {
    /**
     * Fetches the url.
     * @param url The url.
     * @param init The request details.
     */
     execute(url: RequestInfo, init?: RequestInit | undefined): Promise<Response>;
}

/**
 * A policy which determines whether a header should be logged.
 */
export interface ShouldLogHeaderPolicy {
    /**
     * Identifies whether the header specified should be logged.
     * @param name The name of the header.
     * @param value The value of the header.
     */
    shouldLog(name: string, value: string): boolean;
}

/**
 * When too many requests have been received within the alloted time window.
 */
const TOO_MANY_REQUESTS = 429;

/**
 * When the service is down (eg. normal maintenance window).
 */
const SERVICE_UNAVAILABLE = 503;

/**
 * Defines the delay needed between retry attempts, which according to Husqvarna this limitation is enforced per second.
 */
const RETRY_DELAY_IN_MILLIS = 1000;

/**
 * Defines the maximum number of retry attempts that need to occur for a given request before abandoning the request.
 */
const DEFAULT_MAX_RETRY_ATTEMPTS = 5;

/**
 * Defines the 'base' multiplicative factor for the exponential backoff function.
 */
const EXPONENTIAL_BACKOFF_MULTIPLIER = 1.97435; // Causes a 30 second maximum backoff.

/**
 * A client which uses node-fetch to perform HTTP requests and includes retryer support.
 */
export class RetryerFetchClient implements FetchClient {
    public constructor(private log: PlatformLogger, private policy: ShouldLogHeaderPolicy, private maxRetryAttempts: number = DEFAULT_MAX_RETRY_ATTEMPTS) { }

    public async execute(url: RequestInfo, init?: RequestInit): Promise<Response> {
        let response: Response;
        let retry: boolean;

        let attempt = 0;
        const id = uuid();

        do {
            retry = false;
            attempt++;

            response = await this.executeCore(id, attempt, url, init);
            if (response.status === TOO_MANY_REQUESTS) {
                retry = await this.onTooManyRequests(attempt);
            } else if (response.status === SERVICE_UNAVAILABLE) {
                retry = await this.onServiceUnavailable();
            }
        } while (retry && attempt < this.maxRetryAttempts);
        
        return response;
    }

    /**
     * Occurs when too many requests have been received by the server within the alloted time window.
     * @param attempt The attempt number which failed.
     * @returns The promise to await.
     */
    protected async onTooManyRequests(attempt: number): Promise<boolean> {
        const delay = Math.pow(EXPONENTIAL_BACKOFF_MULTIPLIER, attempt) * 1000;

        await this.wait(delay);
        return true;
    }

    /**
     * Occurs when the service is unavailable.
     * @returns The promise to await.
     */
    protected async onServiceUnavailable(): Promise<boolean> {
        await this.wait(RETRY_DELAY_IN_MILLIS);
        return true;
    }
    
    protected async wait(ms: number): Promise<void> {
        await new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    protected async executeCore(id: string, attempt: number, url: RequestInfo, init?: RequestInit): Promise<Response> {
        this.log.debug('Sending request [%d/%d]: %s\r\n', attempt, this.maxRetryAttempts, id, JSON.stringify({
            url: url,
            method: init?.method,
            headers: this.interceptRequestHeaders(init?.headers),
            body: init?.body        
        }));

        const response = await this.doFetch(url, init);
        const buffer = await response.buffer();

        let body: string | undefined;

        const b = buffer.toString('utf-8');
        if (b !== undefined && b !== '') {
            body = JSON.parse(b);
        }

        this.log.debug('Received response: %s\r\n', id, JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            headers: this.interceptHeaders(response.headers),
            body: body
        }));

        // Recreate the response since the buffer has already been used.
        return new Response(buffer, {
            headers: response.headers,
            size: response.size,
            status: response.status,
            statusText: response.statusText,
            timeout: response.timeout,
            url: response.url
        });
    }

    protected interceptRequestHeaders(headers: HeadersInit | undefined): { [k: string]: string[] } | undefined {
        if (headers === undefined) {
            return undefined;
        }

        return this.interceptHeaders(new Headers(headers));
    }

    protected interceptHeaders(headers: Headers): { [k: string]: string[] } {
        const result = new Headers();

        headers.forEach((value: string, name: string) => {
            if (this.policy.shouldLog(name, value)) {
                result.append(name, value);
            } else {
                result.append(name, 'REDACTED');
            }
        });

        return result.raw();
    }

    protected doFetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
        return fetch(url, init);
    }
}