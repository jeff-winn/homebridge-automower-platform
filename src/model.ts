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
    mode: string;
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