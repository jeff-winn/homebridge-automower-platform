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
 * A client which uses node-fetch to perform HTTP requests.
 */
export class DefaultFetchClient implements FetchClient {
    public constructor(private log: PlatformLogger) { }

    public async execute(url: RequestInfo, init?: RequestInit): Promise<Response> {
        const id = uuid();

        this.log.debug(`Sending request: ${id}\r\n`, JSON.stringify({
            url: url,
            method: init?.method,
            headers: init?.headers,
            body: init?.body        
        }));

        const response = await fetch(url, init);
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
}