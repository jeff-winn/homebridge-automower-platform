import { Battery, MowerConnection, MowerSettings, MowerState } from './model';

/**
 * Describes a mower status changed event.
 */
export interface MowerStatusChangedEvent {
    mowerId: string;
    attributes: {
        battery: Battery | undefined;
        mower: MowerState | undefined;
        connection: MowerConnection | undefined;
    };
}

/**
 * Describes a mower settings changed event.
 */
export interface MowerSettingsChangedEvent {
    mowerId: string;
    attributes: {
        settings: MowerSettings | undefined;
    };
}