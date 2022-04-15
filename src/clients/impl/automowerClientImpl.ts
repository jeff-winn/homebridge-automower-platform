import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

import { AutomowerClient } from '../automowerClient';
import { Mower, OAuthToken } from '../model';
import { NotAuthorizedError } from '../notAuthorizedError';

export class AutomowerClientImpl implements AutomowerClient {
    constructor(private appKey: string, private baseUrl: string) { }

    getApplicationKey(): string {
        return this.appKey;
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    async doAction(id: string, action: unknown, token: OAuthToken): Promise<void> {
        if (id === '') {
            throw new Error('id cannot be empty.');
        }

        const res = await this.doFetch(this.baseUrl + `/mowers/${id}`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.appKey,
                'Authorization': `Bearer ${token.access_token}`,
                'Authorization-Provider': token.provider
            },
            body: JSON.stringify({
                data: action
            }),
        });

        await this.throwIfStatusNotOk(res);
    }

    protected doFetch(url: RequestInfo, init?: RequestInit | undefined): Promise<Response> {
        return fetch(url, init);
    }

    async getMower(id: string, token: OAuthToken): Promise<Mower | undefined> {
        if (id === '') {
            throw new Error('id cannot be empty.');
        }

        const res = await this.doFetch(this.baseUrl + `/mowers/${id}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': this.appKey,
                'Authorization': `Bearer ${token.access_token}`,
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

    async getMowers(token: OAuthToken): Promise<Mower[]> {
        const res = await this.doFetch(this.baseUrl + '/mowers', {
            method: 'GET',
            headers: {
                'X-Api-Key': this.appKey,
                'Authorization': `Bearer ${token.access_token}`,
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

        if (!response.ok) {
            const errs = await response.json() as ErrorResponse;
            if (errs?.errors[0] !== undefined) {
                const err = errs.errors[0];

                throw new Error(`ERR: [${err.code}] ${err.title}`);
            } else {
                throw new Error(`ERR: ${response.status}`);
            }
        }
    }
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