import * as model from '../../../../model';

import { Activity, Mode, Mower, MowerState, State, StatusAttributes } from '../../../../clients/automower/automowerClient';
import { PlatformLogger } from '../../../../diagnostics/platformLogger';

/**
 * A mechanism which converts a {@link Mower} to a {@link model.MowerState} instance.
 */
export interface AutomowerMowerStateConverter {
    /**
     * Converts the mower.
     * @param mower The mower to convert.
     */
    convertMower(mower: Mower): model.MowerState;

    /**
     * Converts the status attributes.
     * @param attributes The mower attributes to convert.
     */
    convertStatusAttributes(attributes: StatusAttributes): model.MowerState;
}

export class AutomowerMowerStateConverterImpl implements AutomowerMowerStateConverter {
    public constructor(private log: PlatformLogger) { }
    
    public convertMower(mower: Mower): model.MowerState {
        return this.convertStatusAttributes(mower.attributes);
    }

    public convertStatusAttributes(attributes: StatusAttributes): model.MowerState {
        return {
            activity: this.convertActivity(attributes.mower),
            state: this.convertState(attributes)
        };
    }

    protected convertActivity(mower: MowerState): model.Activity {
        if (mower.state === State.OFF) {
            return model.Activity.OFF;
        }

        if (mower.mode === Mode.HOME || (mower.activity === Activity.PARKED_IN_CS)) {
            return model.Activity.PARKED;
        }

        if (mower.mode === Mode.MAIN_AREA || mower.mode === Mode.SECONDARY_AREA) {
            return model.Activity.MOWING;
        }        
        
        this.log.debug('VALUE_NOT_SUPPORTED', mower.mode);
        return model.Activity.UNKNOWN;
    }

    protected convertState(attributes: StatusAttributes): model.State {
        if (attributes.battery.batteryPercent === 0) {
            return model.State.FAULTED; // The battery has been depleted, and will need intervention to fix.
        }

        if (attributes.mower.mode === Mode.SECONDARY_AREA && attributes.mower.activity === Activity.STOPPED_IN_GARDEN) {
            return model.State.FAULTED;
        }

        if (attributes.mower.activity === Activity.CHARGING) {
            return model.State.CHARGING;
        }

        if (attributes.mower.activity === Activity.PARKED_IN_CS) {
            return model.State.IDLE;
        }
        
        if (attributes.mower.activity === Activity.GOING_HOME) {
            return model.State.GOING_HOME;
        }

        if (attributes.mower.activity === Activity.LEAVING) {
            return model.State.LEAVING_HOME;
        }
        
        switch (attributes.mower.state) {
            case State.IN_OPERATION:
                return model.State.IN_OPERATION;

            case State.ERROR:
            case State.ERROR_AT_POWER_UP:
            case State.FATAL_ERROR:
            case State.STOPPED:
                return model.State.FAULTED;

            case State.PAUSED:
                return model.State.PAUSED;

            case State.NOT_APPLICABLE:
            case State.OFF:
            case State.WAIT_POWER_UP:
            case State.WAIT_UPDATING:
            case State.UNKNOWN:
                return model.State.UNKNOWN;

            default:
                this.log.debug('VALUE_NOT_SUPPORTED', attributes.mower.state);
                return model.State.UNKNOWN;
        }
    }
}