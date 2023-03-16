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
        switch (mower.attributes.activity.value) {
            case MowerActivity.OK_CUTTING:
            case MowerActivity.OK_CUTTING_TIMER_OVERRIDDEN:
            case MowerActivity.PAUSED:
                return model.Activity.MOWING;

            case MowerActivity.OK_LEAVING:
                return model.Activity.LEAVING_HOME;

            case MowerActivity.OK_SEARCHING:
                return model.Activity.GOING_HOME;

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
        if (mower.attributes.activity.value === MowerActivity.PAUSED) {
            return model.State.PAUSED;
        }

        if (mower.attributes.activity.value === MowerActivity.OK_CHARGING) {
            return model.State.CHARGING;
        }

        if (mower.attributes.state.value === ServiceState.WARNING || mower.attributes.state.value === ServiceState.ERROR) {
            return model.State.FAULTED;
        }

        switch (mower.attributes.lastErrorCode.value) {
            case MowerError.OFF_DISABLED:
            case MowerError.OFF_HATCH_CLOSED:
            case MowerError.OFF_HATCH_OPEN:
                return model.State.OFF;
            
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
}