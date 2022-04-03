import { OAuthToken } from "../authenticationClient";
import { AutomowerClient, Mower } from "../automowerClient";
import fetch, { Response } from 'node-fetch';

export class AutomowerClientImpl implements AutomowerClient {
    constructor(private appKey: string, private baseUrl: string) { }

    getApplicationKey(): string {
        return this.appKey;
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    async getMower(id: string, token: OAuthToken): Promise<Mower | undefined> {
        let res = await fetch(this.baseUrl + `/mowers/${id}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': this.appKey,
                'Authorization': `Bearer ${token.access_token}`,
                'Authorization-Provider': token.provider
            }
        });

        if (res.status == 404) return undefined;        

        await  this.throwIfStatusNotOk(res);

        let response = await res.json() as GetMowerResponse;
        if (response !== undefined) {
            return response.data;
        }

        return undefined;
    }

    async getMowers(token: OAuthToken): Promise<Mower[] | undefined> {
        let res = await fetch(this.baseUrl + '/mowers', {
            method: 'GET',
            headers: {
                'X-Api-Key': this.appKey,
                'Authorization': `Bearer ${token.access_token}`,
                'Authorization-Provider': token.provider
            }
        });

        await this.throwIfStatusNotOk(res);
    
        let response = await res.json() as GetMowersResponse;
        if (response !== undefined) {
            return response.data;
        }

        return undefined;
    }

    private async throwIfStatusNotOk(response: Response): Promise<void> {
        if (!response.ok)
        {
            let errs = await response.json() as ErrorResponse;
            if (errs?.errors[0] !== undefined) {
                let err = errs.errors[0];

                throw `ERR: [${err.code}] ${err.title}`;
            }
            else {
                throw `ERR: ${response.status}`
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
    id: string,
    status: string,
    code: string,
    title: string,
    detail: string
}