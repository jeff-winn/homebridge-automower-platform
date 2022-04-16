import { 
    Battery, 
    Calendar, 
    Headlight, 
    MowerMetadata, 
    MowerState, 
    Planner, 
    Position 
} from './model';

/**
 * Describes the types of events.
 */
export enum AutomowerEventTypes {
    STATUS = 'status-event',
    POSITIONS = 'positions-event',
    SETTINGS = 'settings-event'
}

export interface AutomowerEvent {
    id: string;
    type: AutomowerEventTypes;
}

export interface StatusEvent extends AutomowerEvent {
    attributes: {
        battery: Battery;
        mower: MowerState;
        planner: Planner;
        metadata: MowerMetadata;
    };
}

export interface PositionsEvent extends AutomowerEvent {
    attributes: {
        positions: Position[];
    };
}

export interface SettingsEvent extends AutomowerEvent {
    attributes: {
        calendar?: Calendar;
        cuttingHeight?: number;
        headlight?: Headlight;
    };
}
