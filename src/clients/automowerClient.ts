import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

import { AccessToken, Mower } from '../model';
import { NotAuthorizedError } from '../errors/notAuthorizedError';
import { UnexpectedServerError } from '../errors/unexpectedServerError';
import { Logging } from 'homebridge';
import { v4 as uuid } from 'uuid';

/**
 * A client used to retrieve information about automowers connected to the account.
 */
export interface AutomowerClient {
    /**
     * Instructs the mower to do a specific action.
     * @param id The id of the mower.
     * @param action The action payload (specific to the action being performed).
     * @param token The access token.
     */
    doAction(id: string, action: unknown, token: AccessToken): Promise<void>;

    /**
     * Gets a specific mower connected to the account.
     * @param id The id of the mower.
     * @param token The access token.
     */
    getMower(id: string, token: AccessToken): Promise<Mower | undefined>;

    /**
     * Gets all the mowers connected to the account.
     * @param token The access token.
     */
    getMowers(token: AccessToken): Promise<Mower[]>;
}


/**
 * Describes the response while getting a specific mower.
 */
interface GetMowerResponse {
    data: Mower;
}

/**
 * Describes the response while getting all mowers.
 */
interface GetMowersResponse {
    data: Mower[];
}

/**
 * Describes an error response.
 */
interface ErrorResponse {
    errors: Error[];
}

/**
 * Describes an error.
 */
interface Error {
    id: string;
    status: string;
    code: string;
    title: string;
    detail: string;
}

export class AutomowerClientImpl implements AutomowerClient {
    public constructor(private appKey: string, private baseUrl: string, private log: Logging) { }

    public getApplicationKey(): string {
        return this.appKey;
    }

    public getBaseUrl(): string {
        return this.baseUrl;
    }

    public async doAction(id: string, action: unknown, token: AccessToken): Promise<void> {
        if (id === '') {
            throw new Error('id cannot be empty.');
        }

        if (action === undefined) {
            throw new Error('action cannot be undefined.');
        }

        const res = await this.doFetch(`${this.baseUrl}/mowers/${id}/actions`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.appKey,
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${token.value}`,
                'Authorization-Provider': token.provider
            },
            body: JSON.stringify({
                data: action
            }),
        });

        await this.throwIfStatusNotOk(res);
    }

    protected async doFetch(url: RequestInfo, init?: RequestInit | undefined): Promise<Response> {
        const id = uuid();

        this.log.debug(`Sending web request: ${id}\r\n`, JSON.stringify({
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

    public async getMower(id: string, token: AccessToken): Promise<Mower | undefined> {
        if (id === '') {
            throw new Error('id cannot be empty.');
        }

        const res = await this.doFetch(`${this.baseUrl}/mowers/${id}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': this.appKey,
                'Authorization': `Bearer ${token.value}`,
                'Authorization-Provider': token.provider
            }
        });

        if (res.status === 404) {
            return undefined;
        }

        await this.throwIfStatusNotOk(res);

        const response = await res.json() as GetMowerResponse;
        if (response !== undefined) {
            return response.data;
        }

        return undefined;
    }    

    public async getMowers(token: AccessToken): Promise<Mower[]> {
        const res = await this.doFetch(`${this.baseUrl}/mowers`, {
            method: 'GET',
            headers: {
                'X-Api-Key': this.appKey,
                'Authorization': `Bearer ${token.value}`,
                'Authorization-Provider': token.provider
            }
        });

        await this.throwIfStatusNotOk(res);
    
        const response = await res.json() as GetMowersResponse;
        if (response !== undefined) {
            return response.data;
        }

        return [];
    }

    private async throwIfStatusNotOk(response: Response): Promise<void> {
        if (response.status === 401) {
            throw new NotAuthorizedError();
        }

        if (response.status === 500) {                        
            const errs = await response.json() as ErrorResponse;
            if (errs?.errors[0] !== undefined) {
                const err = errs.errors[0];

                throw new UnexpectedServerError(`ERR: [${err.code}] ${err.title}`);
            } else {
                throw new UnexpectedServerError(`ERR: ${response.status}`);
            }
        }
    }
}
