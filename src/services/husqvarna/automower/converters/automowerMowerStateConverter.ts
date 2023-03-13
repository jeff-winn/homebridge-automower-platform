import * as model from '../../../../model';

import { Activity, Mower, State } from '../../../../clients/automower/automowerClient';
import { PlatformLogger } from '../../../../diagnostics/platformLogger';

/**
 * A mechanism which converts a {@link Mower} to a {@link model.MowerState} instance.
 */
export interface AutomowerMowerStateConverter {
    /**
     * Converts the item.
     * @param mower The mower service item.
     */
    convert(mower: Mower): model.MowerState;
}

export class AutomowerMowerStateConverterImpl implements AutomowerMowerStateConverter {
    public constructor(private log: PlatformLogger) { }
    
    public convert(mower: Mower): model.MowerState {
        return {
            activity: this.convertActivity(mower),
            state: this.convertState(mower)
        };
    }

    protected convertActivity(mower: Mower): model.Activity {
        switch (mower.attributes.mower.activity) {
            case Activity.CHARGING:                
            case Activity.PARKED_IN_CS:
            case Activity.NOT_APPLICABLE:
                return model.Activity.PARKED;
            
            case Activity.GOING_HOME:
                return model.Activity.GOING_HOME;
            
            case Activity.LEAVING:
                return model.Activity.LEAVING_HOME;

            case Activity.STOPPED_IN_GARDEN:
            case Activity.MOWING:
                return model.Activity.MOWING;

            case Activity.UNKNOWN:
                return model.Activity.UNKNOWN;

            default:
                this.log.debug('VALUE_NOT_SUPPORTED', mower.attributes.mower.activity);
                return model.Activity.UNKNOWN;
        }
    }

    protected convertState(mower: Mower): model.State {
        if (mower.attributes.mower.state === State.STOPPED && mower.attributes.mower.errorCode !== 0) {
            return model.State.TAMPERED;
        }

        if (mower.attributes.mower.activity === Activity.CHARGING) {
            return model.State.CHARGING;
        }
        
        switch (mower.attributes.mower.state) {
            case State.IN_OPERATION:
                return model.State.IN_OPERATION;

            case State.ERROR:
            case State.ERROR_AT_POWER_UP:
            case State.FATAL_ERROR:
            case State.RESTRICTED:
            case State.STOPPED:
                return model.State.FAULTED;

            case State.PAUSED:
                return model.State.PAUSED;

            case State.NOT_APPLICABLE:
            case State.OFF:
                return model.State.OFF;
            
            case State.WAIT_POWER_UP:
            case State.WAIT_UPDATING:
            case State.UNKNOWN:
                return model.State.UNKNOWN;

            default:
                this.log.debug('VALUE_NOT_SUPPORTED', mower.attributes.mower.state);
                return model.State.UNKNOWN;
        }
    }
}