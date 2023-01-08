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
    AUTOMOWER = 'automower'    
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
    MOWING = 'mowing',
    PARKED = 'parked',
    GOING_HOME = 'going_home',
    LEAVING_HOME = 'leaving_home',
    UNKNOWN = 'unknown'
}

/**
 * Describes the states of a mower.
 */
export enum State {
    IN_OPERATION = 'in_operation',
    PAUSED = 'paused',
    STOPPED = 'stopped',
    FAULTED = 'faulted',
    TAMPERED = 'tampered',
    UNKNOWN = 'unknown'
}

/**
 * Describes a mower.
 */
export interface Mower {
    id: string;
    attributes: {
        metadata: MowerMetadata;
        connection: MowerConnection;
        mower: MowerState;
        battery: Battery;
        schedule: MowerSchedule;
    };
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
    isLowBattery: boolean;
    isCharging: boolean;
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
 * Describes the mower schedule.
 */
export interface MowerSchedule {
    isRunContinuously: boolean;
    isRunOnSchedule: boolean;
    isRunInFuture: boolean;
}