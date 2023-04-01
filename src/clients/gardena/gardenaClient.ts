import { v4 as uuid } from 'uuid';

import { ErrorFactory } from '../../errors/errorFactory';
import { AccessToken } from '../../model';
import { PLUGIN_ID } from '../../settings';
import { FetchClient, Response } from '../fetchClient';

/**
 * Defines the types of items.
 */
export enum ItemType {
    LOCATION = 'LOCATION',
    DEVICE = 'DEVICE',
    MOWER = 'MOWER',
    COMMON = 'COMMON',
    WEBSOCKET = 'WEBSOCKET'
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
export enum RFLinkState {
    /**
     * The device is ONLINE if radio exchange is expected to be possible.
     */
    ONLINE = 'ONLINE',

    /**
     * The device is OFFLINE if radio exchange is not possible.
     */
    OFFLINE = 'OFFLINE',
    UNKNOWN = 'UNKNOWN'
}

/**
 * Defines the service states.
 */
export enum ServiceState {
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
export enum MowerActivity {
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
 * Defines the mower errors.
 */
export enum MowerError {
    /**
     * No explanation provided.
     */
    NO_MESSAGE = 'NO_MESSAGE',

    /**
     * Trapped.
     */
    TRAPPED = 'TRAPPED',

    /**
     * Upside down.
     */
    UPSIDE_DOWN = 'UPSIDE_DOWN',

    /**
     * Alarm! Mower lifted.
     */
    ALARM_MOWER_LIFTED = 'ALARM_MOWER_LIFTED',

    /**
     * Lifted.
     */
    LIFTED = 'LIFTED',

    /**
     * Mower lifted.
     */
    TEMPORARILY_LIFTED = 'TEMPORARILY_LIFTED',

    /**
     * Mower disabled on main switch.
     */
    OFF_DISABLED = 'OFF_DISABLED',

    /**
     * Mower in waiting state with hatch open.
     */
    OFF_HATCH_OPEN = 'OFF_HATCH_OPEN',

    /**
     * Mower in waiting state with hatch closed.
     */
    OFF_HATCH_CLOSED = 'OFF_HATCH_CLOSED'
}

/**
 * Describes a data item.
 */
export interface DataItem {
    id: string;
    type: ItemType;
}

/**
 * Describes a location.
 */
export interface FullLocationDataItem extends DataItem {
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
    type: ItemType;    
}

/**
 * Describes a device.
 */
export interface DeviceDataItem extends DataItem {
    relationships: {
        location: {
            data: LocationLink;
        };
        services: {
            data: ServiceLink[];
        };
    };
}

/**
 * Describes a timestamped mower error.
 */
export interface TimestampedMowerError {
    value: MowerError;
    timestamp: string;
}

/**
 * Describes a mower.
 */
export interface MowerServiceDataItem extends DataItem {
    relationships: {
        device: {
            data: DeviceLink;
        };
    };
    attributes: {
        state: {
            value: ServiceState;
            timestamp: string;
        };
        activity: {
            value: MowerActivity;
            timestamp: string;
        };
        lastErrorCode?: TimestampedMowerError;
        operatingHours: {
            value: number;
        };
    };
}

/**
 * Describes a common object.
 */
export interface CommonServiceDataItem extends DataItem {
    relationships: {
        device: {
            data: DeviceLink;
        };
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
            value: RFLinkState;
        };
    };
}

/**
 * Describes a device link.
 */
export interface DeviceLink {
    id: string;
    type: ItemType;
}

/**
 * Describes a service link.
 */
export interface ServiceLink {
    id: string;
    type: ItemType;
}

/**
 * The location with the included data items and their associated services.
 */
export interface LocationResponse {
    data: FullLocationDataItem;
    included: DataItem[];
}

/**
 * The list of locations that belong to this user, without devices or services. Used to find out valid location IDs.
 */
export interface LocationsResponse {
    data: LocationDataItem[];
}

/**
 * Describes a location search reference.
 */
export interface LocationDataItem extends DataItem {
    attributes: {
        name: string;
    };
}

/**
 * Describes a web socket location.
 */
export interface WebSocket {
    /**
     * Time window for connection, starting from issuing this POST request, seconds.
     */
    validity: number;
    
    /**
     * Location of the socket.
     */
    url: string;
}

/**
 * Describes a web socket created response.
 */
export interface WebSocketCreatedResponse {
    data: WebSocketDataItem;
}

/**
 * Describes an endpoint for subscribing to live updates to the system.
 */
export interface WebSocketDataItem extends DataItem {
    attributes: WebSocket;
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
     * Instructs the mower to do a command..
     * @param id The id of the mower.
     * @param command The command payload (specific to the command being performed).
     * @param token The access token.
     */
    doCommand(id: string, command: unknown, token: AccessToken): Promise<void>;

    /**
     * Gets all the mowers connected to the account.
     * @param token The access token.
     */
    getLocations(token: AccessToken): Promise<LocationsResponse | undefined>;

    /**
     * Gets a location connected to the account.
     * @param locationId The location id.
     * @param token The access token.
     */
    getLocation(locationId: string, token: AccessToken): Promise<LocationResponse | undefined>;

    /**
     * Creates a socket for stream updates from the location specified.
     * @param locationId The location id.
     * @param token The access token.
     */
    createSocket(locationId: string, token: AccessToken): Promise<WebSocketCreatedResponse>;
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

    public async createSocket(locationId: string, token: AccessToken): Promise<WebSocketCreatedResponse> {
        this.guardAppKeyMustBeProvided();

        const req = {
            data: {
                id: uuid(),
                type: ItemType.WEBSOCKET,
                attributes: {
                    locationId: locationId
                }
            }
        };

        const res = await this.fetch.execute(`${this.baseUrl}/websocket`, {
            method: 'POST',
            headers: {
                'X-Application-Id': PLUGIN_ID,
                'X-Api-Key': this.appKey!,
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${token.value}`,
                'Authorization-Provider': token.provider
            },
            body: JSON.stringify(req)
        });

        await this.throwIfStatusNotOk(res);

        const response = await res.json() as WebSocketCreatedResponse;
        return response;
    }

    public async doCommand(id: string, command: unknown, token: AccessToken): Promise<void> {
        this.guardAppKeyMustBeProvided();
        
        const req = {
            data: command
        };

        const res = await this.fetch.execute(`${this.baseUrl}/command/${id}`, {
            method: 'PUT',
            headers: {
                'X-Application-Id': PLUGIN_ID,
                'X-Api-Key': this.appKey!,
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${token.value}`,
                'Authorization-Provider': token.provider
            },
            body: JSON.stringify(req)
        });

        await this.throwIfStatusNotOk(res);
    }

    public async getLocation(locationId: string, token: AccessToken): Promise<LocationResponse | undefined> {
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

        const response = await res.json() as LocationResponse;
        return response;
    }

    public async getLocations(token: AccessToken): Promise<LocationsResponse | undefined> {
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

        const response = await res.json() as LocationsResponse;
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