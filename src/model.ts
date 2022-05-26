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
    ALWAYS_ON = 'ALWAYS_ON',
    ALWAYS_OFF = 'ALWAYS_OFF',
    EVENING_ONLY = 'EVENING_ONLY',
    EVENING_AND_NIGHT = 'EVENING_AND_NIGHT'
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
    MAIN_AREA = 'MAIN_AREA',
    SECONDARY_AREA = 'SECONDARY_AREA',
    HOME = 'HOME',
    DEMO = 'DEMO',
    UNKNOWN = 'UNKNOWN'
}

export enum Activity {
    UNKNOWN = 'UNKNOWN',
    NOT_APPLICABLE = 'NOT_APPLICABLE',
    MOWING = 'MOWING',
    GOING_HOME = 'GOING_HOME',    
    CHARGING = 'CHARGING',
    LEAVING = 'LEAVING',
    PARKED_IN_CS = 'PARKED_IN_CS',
    STOPPED_IN_GARDEN = 'STOPPED_IN_GARDEN'
}

export enum State {
    UNKNOWN = 'UNKNOWN',
    NOT_APPLICABLE = 'NOT_APPLICABLE',
    PAUSED = 'PAUSED',
    IN_OPERATION = 'IN_OPERATION',
    WAIT_UPDATING = 'WAIT_UPDATING',
    WAIT_POWER_UP = 'WAIT_POWER_UP',
    RESTRICTED = 'RESTRICTED',
    OFF = 'OFF',
    STOPPED = 'STOPPED',
    ERROR = 'ERROR',
    FATAL_ERROR = 'FATAL_ERROR',
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
    FORCE_MOW = 'FORCE_MOW'
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