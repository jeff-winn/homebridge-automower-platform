import { ErrorFactory } from '../../errors/errorFactory';
import { AccessToken } from '../../model';
import { PLUGIN_ID } from '../../settings';
import { FetchClient, Response } from '../fetchClient';

export enum ThingType {
    LOCATION = 'LOCATION',
    DEVICE = 'DEVICE',
    MOWER = 'MOWER',
    COMMON = 'COMMON'
}

/**
 * Describes a location.
 */
export interface Location extends LocationRef {
    relationships: {
        devices: {
            data: DeviceRef[];
        };
    };
    attributes: {
        name: string;
    };
}

/**
 * Describes a location reference.
 */
export interface LocationRef {
    id: string;
    type: ThingType;    
}

/**
 * Describes a device.
 */
export interface Device extends DeviceRef {
    relationships: {
        location: {
            data: LocationRef;
        };
        services: {
            data: ServiceRef[];
        };
    };
}

/**
 * Describes a mower.
 */
export interface Mower extends DeviceRef {
    relationships: {
        data: DeviceRef;
    };
    attributes: {
        state: {
            value: string;
            timestamp: string;
        };
        activity: {
            value: string;
            timestamp: string;
        };
        lastErrorCode: {
            value: string;
            timestamp: string;
        };
        operatingHours: {
            value: number;
        };
    };
}

/**
 * Describes a common object.
 */
export interface Common extends DeviceRef {
    relationships: {
        data: DeviceRef;
    };
    attributes: {
        name: {
            value: string;
        };
        batteryLevel: {
            value: number;
            timestamp: string;
        };
        batteryState: {
            value: string;
            timestamp: string;
        };
        rfLinkLevel: {
            value: number;
            timestamp: string;
        };
        serial: {
            value: string;
        };
        modelType: {
            value: string;
        };
        rfLinkState: {
            value: string;
        }
    };
}

/**
 * Describes a device reference.
 */
export interface DeviceRef {
    id: string;
    type: ThingType;
}

/**
 * Describes a service reference.
 */
export interface ServiceRef {
    id: string;
    type: ThingType;
}

/**
 * Describes a get locations response.
 */
export interface GetLocationResponse {
    data: Location;
    included: DeviceRef[];
}

/**
 * Describes a get locations response.
 */
export interface GetLocationsResponse {
    data: LocationSearchRef[];
}

/**
 * Describes a location search reference.
 */
export interface LocationSearchRef extends LocationRef {
    attributes: {
        name: string;
    };
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

/**
 * A client used to retrieve information about automowers connected to the account.
 */
export interface GardenaClient {
    /**
     * Gets all the mowers connected to the account.
     * @param token The access token.
     */
    getLocations(token: AccessToken): Promise<GetLocationsResponse | undefined>;

    /**
     * Gets a location connected to the account.
     * @param locationId The location id.
     * @param token The access token.
     */
    getLocation(locationId: string, token: AccessToken): Promise<GetLocationResponse | undefined>;
}

export class GardenaClientImpl implements GardenaClient {
    public constructor(private appKey: string | undefined, private baseUrl: string, private fetch: FetchClient, 
        private errorFactory: ErrorFactory) { }

    public getApplicationKey(): string | undefined {
        return this.appKey;
    }

    public getBaseUrl(): string {
        return this.baseUrl;
    }

    public async getLocation(locationId: string, token: AccessToken): Promise<GetLocationResponse | undefined> {
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

        if (res.status === 404) {
            return undefined;  // The location request does not exist.
        }

        await this.throwIfStatusNotOk(res);

        const response = await res.json() as GetLocationResponse;
        return response;
    }

    public async getLocations(token: AccessToken): Promise<GetLocationsResponse | undefined> {
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

        if (res.status === 404) {
            return undefined; // No locations available.
        }

        await this.throwIfStatusNotOk(res);

        const response = await res.json() as GetLocationsResponse;
        return response;
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