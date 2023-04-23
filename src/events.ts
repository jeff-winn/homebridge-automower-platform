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
    /**
     * Describes the event attributes.
     */
    attributes: {
        /**
         * Describes the battery state.
         */
        battery?: Battery;

        /**
         * Describes the mower state.
         */
        mower?: MowerState;

        /**
         * Describes the connection to the device.
         */
        connection?: MowerConnection;
    };
}

/**
 * Describes a mower settings changed event.
 */
export interface MowerSettingsChangedEvent extends MowerEvent {
    /**
     * Describes the event attributes.
     */
    attributes: {
        /**
         * Describes the mower schedule.
         */
        schedule?: MowerSchedule;

        /**
         * Describes the mower settings.
         */
        settings?: MowerSettings;
    };
}