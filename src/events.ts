import { 
    Battery,
    Calendar, 
    Headlight, 
    MowerMetadata, 
    MowerState, 
    Planner, 
    Position 
} from './model';

export interface AutomowerEvent {
    id: string;
    type: AutomowerEventTypes;
}

export enum AutomowerEventTypes {
    UNKNOWN = 'unknown-event',
    STATUS = 'status-event',
    POSITIONS = 'positions-event',
    SETTINGS = 'settings-event'
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
