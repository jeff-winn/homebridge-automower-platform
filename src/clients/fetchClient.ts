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
 * A client which uses node-fetch to perform HTTP requests and includes retryer support.
 */
export class RetryerFetchClient implements FetchClient {
    public constructor(private log: PlatformLogger, private maxRetryAttempts: number, private maxDelayInMillis: number) { }

    public async execute(url: RequestInfo, init?: RequestInit): Promise<Response> {
        let retry = false;
        let response: Response;
        let attempts = 0;

        do {
            retry = false;
            attempts++;

            response = await this.executeCore(url, init);
            if (response.status === 429) {
                await this.onTooManyRequests();
                retry = true;
            }
        } while (retry && attempts <= this.maxRetryAttempts);
        
        return response;
    }

    private async onTooManyRequests(): Promise<void> {
        const delay = this.rand(0, this.maxDelayInMillis);
        await this.sleep(delay);
    }

    private rand(min: number, max: number) {
        return Math.floor(
            Math.random() * (max - min + 1) + max
        );
    }

    private sleep(ms: number): Promise<unknown> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    protected async executeCore(url: RequestInfo, init?: RequestInit): Promise<Response> {
        const id = uuid();

        this.log.debug(`Sending request: ${id}\r\n`, JSON.stringify({
            url: url,
            method: init?.method,
            headers: init?.headers,
            body: init?.body        
        }));

        const response = await this.doFetch(url, init);
        const buffer = await response.buffer();

        this.log.debug(`Received response: ${id}\r\n`, JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            headers: response.headers.raw,
            body: JSON.parse(buffer.toString('utf-8'))
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