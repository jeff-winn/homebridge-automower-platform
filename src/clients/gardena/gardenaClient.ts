import { ErrorFactory } from '../../errors/errorFactory';
import { AccessToken } from '../../model';
import { PLUGIN_ID } from '../../settings';
import { FetchClient, Response } from '../fetchClient';

/**
 * Defines the types of things.
 */
export enum ThingType {
    LOCATION = 'LOCATION',
    DEVICE = 'DEVICE',
    MOWER = 'MOWER',
    COMMON = 'COMMON'
}

/**
 * Defines the battery states.
 */
export enum BatteryState {
    /**
     * The battery operates normally.
     */
    OK = 'OK',

    /**
     * The battery is getting depleted but is still OK for the short term device operation.
     */
    LOW = 'LOW',

    /**
     * The battery must be replaced now, the next device operation might fail with it.
     */
    REPLACE_NOW = 'REPLACE_NOW',

    /**
     * The battery must be replaced because device fails to operate with it.
     */
    OUT_OF_OPERATION = 'OUT_OF_OPERATION',

    /**
     * The battery is being charged.
     */
    CHARGING = 'CHARGING',

    /**
     * This device has no battery.
     */
    NO_BATTERY = 'NO_BATTERY',

    /**
     * The battery state can not be determined.
     */
    UNKNOWN = 'UNKNOWN'
}

/**
 * Defines the RF link states.
 */
export enum RfLinkState {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    UNKNOWN = 'UNKNOWN'
}

/**
 * Defines the mower states.
 */
export enum State {
    /**
     * The service is fully operation can receive commands.
     */
    OK = 'OK',

    /**
     * The user must pay attention to the "lastErrorCode" field. Automatic operation might be impaired.
     */
    WARNING = 'WARNING',

    /**
     * The user must pay attention to the "lastErrorCode" field. Automatic operation is impossible.
     */
    ERROR = 'ERROR',

    /**
     * The service is online but can not be used. See service description for more details.
     */
    UNAVAILABLE = 'UNAVAILABLE'    
}

/**
 * Defines the mower activities.
 */
export enum Activity {
    /**
     * The mower in a waiting state with hatch closed.
     */
    PAUSED = 'PAUSED',

    /**
     * The mower is cutting in AUTO mode (schedule).
     */
    OK_CUTTING = 'OK_CUTTING',

    /**
     * The mower is cutting outside schedule.
     */
    OK_CUTTING_TIMER_OVERRIDDEN = 'OK_CUTTING_TIMER_OVERRIDDEN',

    /**
     * The mower is searching for the charging station.
     */
    OK_SEARCHING = 'OK_SEARCHING',

    /**
     * The mower is leaving charging station.
     */
    OK_LEAVING = 'OK_LEAVING',

    /**
     * The mower has to be mowing but insufficient charge level keeps it in the charging station.
     */
    OK_CHARGING = 'OK_CHARGING',
    
    /**
     * The mower is parked according to timer, will start again at configured time.
     */
    PARKED_TIMER = 'PARKED_TIMER',

    /**
     * The mower is parked until further notice.
     */
    PARKED_PARK_SELECTED = 'PARKED_PARK_SELECTED',

    /**
     * The mower skips mowing because of insufficient grass height.
     */
    PARKED_AUTOTIMER = 'PARKED_AUTOTIMER',

    /**
     * No activity is happening, perhaps due to an error.
     */
    NONE = 'NONE'
}

/**
 * Describes a location.
 */
export interface Location extends LocationLink {
    relationships: {
        devices: {
            data: DeviceLink[];
        };
    };
    attributes: {
        name: string;
    };
}

/**
 * Describes a location link.
 */
export interface LocationLink {
    id: string;
    type: ThingType;    
}

/**
 * Describes a device.
 */
export interface Device extends DeviceLink {
    relationships: {
        location: {
            data: LocationLink;
        };
        services: {
            data: ServiceRef[];
        };
    };
}

/**
 * Describes a mower.
 */
export interface Mower extends DeviceLink {
    relationships: {
        data: DeviceLink;
    };
    attributes: {
        state: {
            value: State;
            timestamp: string;
        };
        activity: {
            value: Activity;
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
export interface Common extends DeviceLink {
    relationships: {
        data: DeviceLink;
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
            value: BatteryState;
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
            value: RfLinkState;
        };
    };
}

/**
 * Describes a device reference.
 */
export interface DeviceLink {
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
    included: DeviceLink[];
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
export interface LocationSearchRef extends LocationLink {
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