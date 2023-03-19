/**
 * Describes an access token.
 */
export interface AccessToken {
    value: string;
    provider: string;
}

/**
 * Defines the supported device types.
 */
export enum DeviceType {
    AUTOMOWER = 'automower',
    GARDENA = 'gardena'
}

/**
 * Defines the supported authentication modes.
 */
export enum AuthenticationMode {
    PASSWORD = 'password',    
    CLIENT_CREDENTIALS = 'client_credentials'
}

/**
 * Describes the activities of a mower.
 */
export enum Activity {
    /**
     * The mower is mowing.
     */
    MOWING = 'mowing',

    /**
     * The mower is parked.
     */
    PARKED = 'parked',

    /**
     * The mower is going home.
     */
    GOING_HOME = 'going_home',

    /**
     * The mower is leaving home.
     */
    LEAVING_HOME = 'leaving_home',

    /**
     * The mower activity is unknown.
     */
    UNKNOWN = 'unknown'
}

/**
 * Describes the states of a mower.
 */
export enum State {
    /**
     * The mower is charging in the docking station.
     */
    CHARGING = 'charging',

    /**
     * The mower is in operation.
     */
    IN_OPERATION = 'in_operation',


    /**
     * The mower is dormant while waiting for an instruction, or until the next scheduled execution.
     */
    DORMANT = 'dormant',

    /**
     * The mower is paused.
     */
    PAUSED = 'paused',

    /**
     * The mower has faulted.
     */
    FAULTED = 'faulted',

    /**
     * The mower has been tampered.
     */
    TAMPERED = 'tampered',

    /**
     * The mower is off.
     */
    OFF = 'off',

    /**
     * The mower state is unknown.
     */
    UNKNOWN = 'unknown'
}

/**
 * Describes a mower.
 */
export interface Mower {
    id: string;    
    attributes: {
        location: Location | undefined;
        metadata: MowerMetadata;
        connection: MowerConnection;
        mower: MowerState;
        battery: Battery;
        schedule: MowerSchedule | undefined;
        settings: MowerSettings | undefined;
    };
}

/**
 * Describes the location associated with a mower.
 */
export interface Location {
    id: string;
}

/**
 * Describes the state of a mower.
 */
export interface MowerState {
    activity: Activity;
    state: State;
}

/**
 * Describes a battery.
 */
export interface Battery {
    level: number;
}

/**
 * Describes metadata about a mower.
 */
export interface MowerMetadata {
    name: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
}

/**
 * Describes a connection to a mower.
 */
export interface MowerConnection {
    connected: boolean;
}

/**
 * Describes a mower schedule.
 */
export interface MowerSchedule {
    runContinuously: boolean;
    runInFuture: boolean;
    runOnSchedule: boolean;
}

/**
 * Describes mower settings.
 */
export interface MowerSettings {
    cuttingHeight: number;
}