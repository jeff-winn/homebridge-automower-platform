import { ErrorFactory } from '../../errors/errorFactory';
import { AccessToken } from '../../model';
import { PLUGIN_ID } from '../../settings';
import { FetchClient, Response } from '../fetchClient';

/**
 * Describes a mower.
 */
export interface Mower {
    type: string;
    id: string;    
    attributes: MowerAttributes;
}

/**
 * Describes the mower attributes.
 */
export interface MowerAttributes extends StatusAttributes {
    system: Device;
    calendar: Calendar;
    positions: Position[];
    settings: Settings;
    statistics: Statistics;
}

/**
 * Describes status attributes.
 */
export interface StatusAttributes {
    battery: Battery;
    mower: MowerState;
    planner: Planner;
    metadata: MowerMetadata;
}

/**
 * Describes the battery.
 */
export interface Battery {
    batteryPercent: number;
}

/**
 * Describes the calendar.
 */
export interface Calendar {
    tasks: Task[];
}

/**
 * Describes the device.
 */
export interface Device {
    name: string;
    model: string;
    serialNumber: number;
}

/**
 * Describes the information about the headlight.
 */
export interface Headlight {
    mode: HeadlightMode;
}

/**
 * Defines the headlight modes.
 */
export enum HeadlightMode {
    ALWAYS_ON = 'ALWAYS_ON',
    ALWAYS_OFF = 'ALWAYS_OFF',
    EVENING_ONLY = 'EVENING_ONLY',
    EVENING_AND_NIGHT = 'EVENING_AND_NIGHT'
}

/**
 * Describes the settings for the mower.
 */
export interface Settings {
    cuttingHeight: number;
    headlight: Headlight;
}

/**
 * Describes the additional metadata about a mower.
 */
export interface MowerMetadata {
    connected: boolean;
    statusTimestamp: number;
}

/**
 * Describes the mower state.
 */
export interface MowerState {
    mode: Mode;
    activity: Activity;
    state: State;
    errorCode: number;
    errorCodeTimestamp: number;
}

/**
 * Defines the modes.
 */
export enum Mode {
    /**
     * Mower will mow until low battery. Go home and charge. Leave and continue mowing. Week schedule is used. Schedule can be overridden with forced park or forced mowing.
     */
    MAIN_AREA = 'MAIN_AREA',

    /**
     * Mower is in secondary area. Schedule is overridden with forced park or forced mowing. Mower will mow for request time or untill the battery runs out.
     */
    SECONDARY_AREA = 'SECONDARY_AREA',

    /**
     * Mower goes home and parks forever. Week schedule is not used. Cannot be overridden with forced mowing.
     */
    HOME = 'HOME',

    /**
     * Same as main area, but shorter times. No blade operation.
     */
    DEMO = 'DEMO',

    /**
     * Unknown mode.
     */
    UNKNOWN = 'UNKNOWN'
}

/**
 * Defines the activities.
 */
export enum Activity {
    /**
     * Unknown activity.
     */
    UNKNOWN = 'UNKNOWN',
    
    /**
     * Manual start required in mower.
     */
    NOT_APPLICABLE = 'NOT_APPLICABLE',

    /**
     * Mower is mowing lawn. If in demo mode the blades are not in operation.
     */
    MOWING = 'MOWING',

    /**
     * Mower is going home to the charging station.
     */
    GOING_HOME = 'GOING_HOME',

    /**
     * Mower is charging in station due to low battery.
     */
    CHARGING = 'CHARGING',
    
    /**
     * Mower is leaving the charging station.
     */
    LEAVING = 'LEAVING',

    /**
     * Mower is parked in charging station.
     */
    PARKED_IN_CS = 'PARKED_IN_CS',

    /**
     * Mower has stopped. Needs manual action to resume.
     */
    STOPPED_IN_GARDEN = 'STOPPED_IN_GARDEN'
}

/**
 * Defines the states.
 */
export enum State {
    /**
     * Unknown state.
     */
    UNKNOWN = 'UNKNOWN',

    /**
     * State is not applicable.
     */
    NOT_APPLICABLE = 'NOT_APPLICABLE',

    /**
     * Mower has been paused by user.
     */
    PAUSED = 'PAUSED',

    /**
     * Mower is in operation. See value in activity for status.
     */
    IN_OPERATION = 'IN_OPERATION',

    /**
     * Mower is downloading new firmware.
     */
    WAIT_UPDATING = 'WAIT_UPDATING',

    /**
     * Mower is performing power up tests.
     */
    WAIT_POWER_UP = 'WAIT_POWER_UP',

    /**
     * Mower can currently not mow due to week calender, or override park.
     */
    RESTRICTED = 'RESTRICTED',

    /**
     * Mower is turned off.
     */
    OFF = 'OFF',

    /**
     * Mower is stopped requires manual action.
     */
    STOPPED = 'STOPPED',

    /**
     * An error has occurred. Mower requires manual action.
     */
    ERROR = 'ERROR',

    /**
     * An error has occurred. Mower requires manual action.
     */
    FATAL_ERROR = 'FATAL_ERROR',

    /**
     * An error has occurred. Mower requires manual action.
     */
    ERROR_AT_POWER_UP = 'ERROR_AT_POWER_UP'
}

/**
 * Describes the mower planner.
 */
export interface Planner {
    nextStartTimestamp: number;
    override: {
        action?: OverrideAction;
    };
    restrictedReason?: RestrictedReason;
}

/**
 * Defines the possible reasons a mower may be restricted from operation.
 */
export enum RestrictedReason {
    NONE = 'NONE',
    WEEK_SCHEDULE = 'WEEK_SCHEDULE',
    PARK_OVERRIDE = 'PARK_OVERRIDE',
    SENSOR = 'SENSOR',
    DAILY_LIMIT = 'DAILY_LIMIT',
    FOTA = 'FOTA',
    FROST = 'FROST',
    NOT_APPLICABLE = 'NOT_APPLICABLE'
}

/**
 * Defines the possible reasons mower behavior may be overridden.
 */
export enum OverrideAction {
    NOT_ACTIVE = 'NOT_ACTIVE',
    NO_SOURCE = 'NO_SOURCE',
    FORCE_PARK = 'FORCE_PARK',
    FORCE_MOW = 'FORCE_MOW',
    WEEK_TIMER = 'WEEK_TIMER'
}

/**
 * Describes the mower position.
 */
export interface Position {
    latitude: number;
    longitude: number;
}

/**
 * Describes a task for the mower.
 */
export interface Task {
    start: number;
    duration: number;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
}

/**
 * Describes the statistics for the mower.
 */
export interface Statistics {
    numberOfChargingCycles: number;
    numberOfCollisions: number;
    totalChargingTime: number;
    totalCuttingTime: number;
    totalRunningTime: number;
    totalSearchingTime: number;
}

/**
 * A client used to retrieve information about automowers connected to the account.
 */
export interface AutomowerClient {
    /**
     * Changes the settings of the mower.
     * @param id The id of the mower.
     * @param settings The settings to update.
     * @param token The access token.
     */
    changeSettings(id: string, settings: ChangeSettingsRequest, token: AccessToken): Promise<void>;

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
     * @returns The mower (if available), otherwise an undefined value.
     */
    getMower(id: string, token: AccessToken): Promise<Mower | undefined>;

    /**
     * Gets all the mowers connected to the account.
     * @param token The access token.
     * @returns The array of mowers.
     */
    getMowers(token: AccessToken): Promise<Mower[]>;
}

/**
 * Describes the request when changing mower settings.
 */
export interface ChangeSettingsRequest {
    cuttingHeight?: number;
    headlight?: Headlight;
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
            throw this.errorFactory.badConfigurationError('APP_KEY_MISSING', 'CFG0001');
        }
    }
    
    public async changeSettings(id: string, settings: ChangeSettingsRequest, token: AccessToken): Promise<void> {
        if (id === '') {
            throw new Error('id cannot be empty.');
        }

        this.guardAppKeyMustBeProvided();

        const res = await this.fetch.execute(`${this.baseUrl}/mowers/${id}/settings`, {
            method: 'POST',
            headers: {
                'X-Application-Id': PLUGIN_ID,
                'X-Api-Key': this.appKey!,
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${token.value}`,
                'Authorization-Provider': token.provider
            },
            body: JSON.stringify({                
                data: {
                    type: 'settings',
                    attributes: settings
                }
            })
        });

        await this.throwIfStatusNotOk(res);
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
                'X-Application-Id': PLUGIN_ID,
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
                'X-Application-Id': PLUGIN_ID,
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
                'X-Application-Id': PLUGIN_ID,
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
