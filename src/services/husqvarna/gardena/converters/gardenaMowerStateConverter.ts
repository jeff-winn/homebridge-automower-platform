import * as model from '../../../../model';

import { MowerActivity, MowerError, MowerServiceDataItem, ServiceState } from '../../../../clients/gardena/gardenaClient';
import { PlatformLogger } from '../../../../diagnostics/platformLogger';

/**
 * A mechanism which converts a {@link Mower} to a {@link model.MowerState} instance.
 */
export interface GardenaMowerStateConverter {
    /**
     * Converts the item.
     * @param mower The mower service item.
     */
    convert(mower: MowerServiceDataItem): model.MowerState;
}

export class GardenaMowerStateConverterImpl implements GardenaMowerStateConverter {
    public constructor(private log: PlatformLogger) { }

    public convert(mower: MowerServiceDataItem): model.MowerState {
        return {
            activity: this.convertActivity(mower),
            state: this.convertState(mower)
        };
    }

    protected convertActivity(mower: MowerServiceDataItem): model.Activity {
        if (mower.attributes.lastErrorCode?.value === MowerError.OFF_DISABLED) {
            return model.Activity.OFF;
        }

        switch (mower.attributes.activity.value) {
            case MowerActivity.OK_CUTTING:
            case MowerActivity.OK_CUTTING_TIMER_OVERRIDDEN:
            case MowerActivity.PAUSED:
            case MowerActivity.OK_LEAVING:
            case MowerActivity.OK_SEARCHING:
                return model.Activity.MOWING;

            case MowerActivity.OK_CHARGING:
            case MowerActivity.PARKED_AUTOTIMER:
            case MowerActivity.PARKED_PARK_SELECTED:
            case MowerActivity.PARKED_TIMER:
                return model.Activity.PARKED;

            case MowerActivity.NONE:
                return model.Activity.UNKNOWN;

            default:
                this.log.debug('VALUE_NOT_SUPPORTED', mower.attributes.activity.value);
                return model.Activity.UNKNOWN;
        }
    }

    protected convertState(mower: MowerServiceDataItem): model.State {
        if (mower.attributes.lastErrorCode !== undefined) {
            switch (mower.attributes.lastErrorCode.value) {
                case MowerError.OFF_DISABLED:
                case MowerError.OFF_HATCH_CLOSED:
                case MowerError.OFF_HATCH_OPEN:
                    return model.State.UNKNOWN;
                
                case MowerError.ALARM_MOWER_LIFTED:
                case MowerError.LIFTED:
                case MowerError.TEMPORARILY_LIFTED:
                    return model.State.TAMPERED;
    
                case MowerError.TRAPPED:
                case MowerError.UPSIDE_DOWN:
                    return model.State.FAULTED;

                default:
                    this.log.debug('VALUE_NOT_SUPPORTED', mower.attributes.activity.value);
                    return model.State.UNKNOWN;
            }
        }
        
        if (mower.attributes.activity.value === MowerActivity.OK_SEARCHING) {
            return model.State.GOING_HOME;
        }

        if (mower.attributes.activity.value === MowerActivity.OK_LEAVING) {
            return model.State.LEAVING_HOME;
        }

        if (mower.attributes.activity.value === MowerActivity.PAUSED) {
            return model.State.PAUSED;
        }

        if (mower.attributes.activity.value === MowerActivity.OK_CHARGING) {
            return model.State.CHARGING;
        }

        if (mower.attributes.activity.value === MowerActivity.PARKED_AUTOTIMER || mower.attributes.activity.value === MowerActivity.PARKED_PARK_SELECTED || 
            mower.attributes.activity.value === MowerActivity.PARKED_TIMER) {
            return model.State.IDLE;
        }
        
        if (mower.attributes.activity.value === MowerActivity.OK_CUTTING || mower.attributes.activity.value === MowerActivity.OK_CUTTING_TIMER_OVERRIDDEN) {
            return model.State.IN_OPERATION;
        }

        if (mower.attributes.state.value === ServiceState.WARNING || mower.attributes.state.value === ServiceState.ERROR) {
            return model.State.FAULTED;
        }        

        return model.State.UNKNOWN;
    }
}