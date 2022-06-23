import { ErrorFactory } from '../errors/errorFactory';
import { AccessToken, Mower } from '../model';
import { FetchClient, Response } from './fetchClient';

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
export interface GetMowerResponse {
    data: Mower;
}

/**
 * Describes the response while getting all mowers.
 */
export interface GetMowersResponse {
    data: Mower[];
}

/**
 * Describes an error response.
 */
export interface ErrorResponse {
    errors: Error[];
}

/**
 * Describes an error.
 */
export interface Error {
    id: string;
    status: string;
    code: string;
    title: string;
    detail: string;
}

export class AutomowerClientImpl implements AutomowerClient {
    public constructor(private appKey: string | undefined, private baseUrl: string, private fetch: FetchClient, 
        private errorFactory: ErrorFactory) { }

    public getApplicationKey(): string | undefined {
        return this.appKey;
    }

    public getBaseUrl(): string {
        return this.baseUrl;
    }

    protected guardAppKeyMustBeProvided(): void {
        if (this.appKey === undefined || this.appKey === '') {
            throw this.errorFactory.badConfigurationError(
                'The appKey setting is missing, please check your configuration and try again.', 
                'CFG0001');
        }
    }

    public async doAction(id: string, action: unknown, token: AccessToken): Promise<void> {
        if (id === '') {
            throw new Error('id cannot be empty.');
        }

        if (action === undefined) {
            throw new Error('action cannot be undefined.');
        }

        this.guardAppKeyMustBeProvided();
        
        const res = await this.fetch.execute(`${this.baseUrl}/mowers/${id}/actions`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.appKey!,
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

    public async getMower(id: string, token: AccessToken): Promise<Mower | undefined> {
        if (id === '') {
            throw new Error('id cannot be empty.');
        }

        this.guardAppKeyMustBeProvided();

        const res = await this.fetch.execute(`${this.baseUrl}/mowers/${id}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': this.appKey!,
                'Authorization': `Bearer ${token.value}`,
                'Authorization-Provider': token.provider
            }
        });

        if (res.status === 404) {
            return undefined;
        }

        await this.throwIfStatusNotOk(res);

        const response = await res.json() as GetMowerResponse;
        return response.data;
    }    

    public async getMowers(token: AccessToken): Promise<Mower[]> {
        this.guardAppKeyMustBeProvided();

        const res = await this.fetch.execute(`${this.baseUrl}/mowers`, {
            method: 'GET',
            headers: {
                'X-Api-Key': this.appKey!,
                'Authorization': `Bearer ${token.value}`,
                'Authorization-Provider': token.provider
            }
        });

        await this.throwIfStatusNotOk(res);
    
        const response = await res.json() as GetMowersResponse;
        return response.data;
    }

    private async throwIfStatusNotOk(response: Response): Promise<void> {
        if (response.status === 401) {
            throw this.errorFactory.notAuthorizedError('The user is not authorized to perform the action requested.', 'ERR0001');
        }

        if (response.status === 500) {                        
            const e = await response.json() as ErrorResponse;

            if (e?.errors?.length > 0) {
                const err = e.errors[0];
                throw this.errorFactory.unexpectedServerError('ERR: [%s] %s', 'ERR0000', err.code, err.title);
            } else {
                throw this.errorFactory.unexpectedServerError('ERR: %s', 'ERR0000', response.status);
            }
        }

        if (!response.ok) {
            const msg = await response.text();
            throw this.errorFactory.unexpectedServerError('ERR: [%s] %s', 'ERR0000', response.status, msg);
        }
    }
}
