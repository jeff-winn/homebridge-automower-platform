import { ErrorFactory } from '../../errors/errorFactory';
import { AccessToken } from '../../model';
import { PLUGIN_ID } from '../../settings';
import { FetchClient, Response } from '../fetchClient';

/**
 * Describes a location.
 */
export interface Location {
    id: string;
    type: string;
    attributes: {
        name: string;
    };
}

/**
 * Describes a get locations response.
 */
export interface GetLocationResponse {
    data: Location;
}

/**
 * Describes a get locations response.
 */
export interface GetLocationsResponse {
    data: Location[];
}

/**
 * A client used to retrieve information about automowers connected to the account.
 */
export interface GardenaClient {
    /**
     * Gets all the mowers connected to the account.
     * @param token The access token.
     */
    getLocations(token: AccessToken): Promise<Location[]>;
}

export class GardenaClientImpl implements GardenaClient {
    public constructor(private appKey: string | undefined, private baseUrl: string, private fetch: FetchClient, 
        private errorFactory: ErrorFactory) { }

    public async getLocation(locationId: string, token: AccessToken): Promise<Location[]> {
        this.guardAppKeyMustBeProvided();
        
        const res = await this.fetch.execute(`${this.baseUrl}/locations/${locationId}`, {
            method: 'GET',
            headers: {
                'X-Application-Id': PLUGIN_ID,
                'X-Api-Key': this.appKey!,
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${token.value}`,
                'Authorization-Provider': token.provider
            }
        });

        await this.throwIfStatusNotOk(res);

        const response = await res.json() as GetLocationsResponse;
        return response.data;
    }

    public async getLocations(token: AccessToken): Promise<Location[]> {
        this.guardAppKeyMustBeProvided();
        
        const res = await this.fetch.execute(`${this.baseUrl}/locations`, {
            method: 'GET',
            headers: {
                'X-Application-Id': PLUGIN_ID,
                'X-Api-Key': this.appKey!,
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${token.value}`,
                'Authorization-Provider': token.provider
            }
        });

        await this.throwIfStatusNotOk(res);

        const response = await res.json() as GetLocationsResponse;
        return response.data;
    }

    protected guardAppKeyMustBeProvided(): void {
        if (this.appKey === undefined || this.appKey === '') {
            throw this.errorFactory.badConfigurationError('APP_KEY_MISSING', 'CFG0001');
        }
    }

    private async throwIfStatusNotOk(response: Response): Promise<void> {
        if (response.status === 401) {
            throw this.errorFactory.notAuthorizedError('NOT_AUTHORIZED', 'ERR0001');
        }

        if (response.status === 500) {                        
            throw this.errorFactory.unexpectedServerError('ERR: %s', 'ERR0000', response.status);
        }

        if (!response.ok) {
            const msg = await response.text();
            throw this.errorFactory.unexpectedServerError('ERR: [%s] %s', 'ERR0000', response.status, msg);
        }
    }
}