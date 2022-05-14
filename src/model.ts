/**
 * Describes an access token.
 */
export interface AccessToken {
    value: string;
    provider: string;
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
 * Describes the information about the headlight.
 */
export interface Headlight {
    mode: HeadlightMode;
}

export enum HeadlightMode {
    'ALWAYS_ON',
    'ALWAYS_OFF',
    'EVENING_ONLY',
    'EVENING_AND_NIGHT'
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

export enum Mode {
    'MAIN_AREA',
    'SECONDARY_AREA',
    'HOME',
    'DEMO',
    'UNKNOWN'
}

export enum Activity {
    'UNKNOWN',
    'NOT_APPLICABLE',
    'MOWING',
    'GOING_HOME',    
    'CHARGING',
    'LEAVING',
    'PARKED_IN_CS',
    'STOPPED_IN_GARDEN'
}

export enum State {
    'UNKNOWN',
    'NOT_APPLICABLE',
    'PAUSED',
    'IN_OPERATION',
    'WAIT_UPDATING',
    'WAIT_POWER_UP',
    'RESTRICTED',
    'OFF',
    'STOPPED',
    'ERROR',
    'FATAL_ERROR',
    'ERROR_AT_POWER_UP'
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
    'NONE',
    'WEEK_SCHEDULE',
    'PARK_OVERRIDE',
    'SENSOR',
    'DAILY_LIMIT',
    'FOTA',
    'FROST',
    'NOT_APPLICABLE'
}

/**
 * Defines the possible reasons mower behavior may be overridden.
 */
export enum OverrideAction {
    'NOT_ACTIVE',
    'NO_SOURCE',
    'FORCE_PARK',
    'FORCE_MOW'
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