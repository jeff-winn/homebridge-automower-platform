import { Battery, MowerConnection, MowerSchedule, MowerSettings, MowerState } from './model';

/**
 * Describes a mower event.
 */
export interface MowerEvent {
    /**
     * The mower id.
     */
    mowerId: string;
}

/**
 * Describes a mower status changed event.
 */
export interface MowerStatusChangedEvent extends MowerEvent {
    attributes: {
        battery: Battery | undefined;
        mower: MowerState | undefined;
        connection: MowerConnection | undefined;
    };
}

/**
 * Describes a mower settings changed event.
 */
export interface MowerSettingsChangedEvent extends MowerEvent {
    attributes: {
        schedule: MowerSchedule | undefined;
        settings: MowerSettings | undefined;
    };
}