import { OAuthToken } from './authenticationClient';

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
    doAction(id: string, action: unknown, token: OAuthToken): Promise<void>;

    /**
     * Gets a specific mower connected to the account.
     * @param id The id of the mower.
     * @param token The access token.
     */
    getMower(id: string, token: OAuthToken): Promise<Mower | undefined>;

    /**
     * Gets all the mowers connected to the account.
     * @param token The access token.
     */
    getMowers(token: OAuthToken): Promise<Mower[]>;
}

/**
 * Describes a mower.
 */
export interface Mower {
    type: string;
    id: string;    
    attributes: {
        system: Device;
        battery: Battery;
        mower: MowerState;
        calendar: Calendar;
        planner: Planner;
        metadata: MowerMetadata;
        positions: Position[];
    };
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
    mode: string;
    activity: string;
    state: string;
    errorCode: number;
    errorCodeTimestamp: number;
}

/**
 * Describes the mower planner.
 */
export interface Planner {
    nextStartTimestamp: number;
    override: {
        action: string;
    };
    restrictedReason: string;
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