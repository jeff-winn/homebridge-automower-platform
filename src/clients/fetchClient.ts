import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import { v4 as uuid } from 'uuid';

import { PlatformLogger } from '../diagnostics/platformLogger';
export { Response, RequestInfo, RequestInit } from 'node-fetch';

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
 * When too many requests have been received within the alloted time window.
 */
const TOO_MANY_REQUESTS = 429;

/**
 * When the service is down (eg. normal maintenance window).
 */
const SERVICE_UNAVAILABLE = 503;

/**
 * A client which uses node-fetch to perform HTTP requests and includes retryer support.
 */
export class RetryerFetchClient implements FetchClient {
    public constructor(private log: PlatformLogger, private maxRetryAttempts: number, private maxDelayInMillis: number) { }

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
                retry = await this.onTooManyRequests();
            } else if (response.status === SERVICE_UNAVAILABLE) {
                retry = await this.onServiceUnavailable();
            }
        } while (retry && attempt <= this.maxRetryAttempts);
        
        return response;
    }

    /**
     * Occurs when too many requests have been received by the server within the alloted time window.
     * @returns The promise to await.
     */
    protected async onTooManyRequests(): Promise<boolean> {
        await this.wait();
        return true;
    }

    /**
     * Occurs when the service is unavailable.
     * @returns The promise to await.
     */
    protected async onServiceUnavailable(): Promise<boolean> {
        await this.wait();
        return true;
    }

    private rand(min: number, max: number) {
        return Math.floor(
            Math.random() * (max - min + 1) + max
        );
    }

    protected async wait(): Promise<void> {
        const delay = this.rand(0, this.maxDelayInMillis);
        await this.waitMilliseconds(delay);
    }

    protected waitMilliseconds(ms: number): Promise<unknown> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    protected async executeCore(id: string, attempt: number, url: RequestInfo, init?: RequestInit): Promise<Response> {
        this.log.debug('Sending request [%d/%d]: %s\r\n', attempt, this.maxRetryAttempts, id, JSON.stringify({
            url: url,
            method: init?.method,
            headers: init?.headers,
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
            headers: response.headers.raw,
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

    protected doFetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
        return fetch(url, init);
    }
}