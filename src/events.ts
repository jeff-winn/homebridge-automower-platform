import { Battery, MowerConnection, MowerSchedule, MowerState } from './model';

/**
 * Describes a battery event.
 */
export interface BatteryEvent {
    id: string;
    attributes: {
        battery: Battery;
    };
}

/**
 * Describes a status event.
 */
export interface StatusEvent {
    id: string;
    attributes: {
        mower: MowerState;
    };
}

/**
 * Describes a schedule event.
 */
export interface ScheduleEvent {
    id: string;
    attributes: {
        schedule: MowerSchedule;
    };
}

/**
 * Describes a connection event.
 */
export interface ConnectionEvent {
    id: string;
    attributes: {
        connection: MowerConnection;
    };
}