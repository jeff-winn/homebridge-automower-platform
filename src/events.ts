import { Battery, MowerSchedule, State } from './model';

/**
 * Describes a battery event.
 */
export interface BatteryEvent {
    id: string;
    battery: Battery;
}

/**
 * Describes a status event.
 */
export interface StatusEvent {
    id: string;
    mower: State;
}

/**
 * Describes a schedule event.
 */
export interface ScheduleEvent {
    id: string;
    schedule: MowerSchedule;
}