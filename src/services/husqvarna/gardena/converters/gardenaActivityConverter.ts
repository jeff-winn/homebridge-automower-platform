import { MowerActivity, MowerServiceDataItem } from '../../../../clients/gardena/gardenaClient';
import { PlatformLogger } from '../../../../diagnostics/platformLogger';

import * as model from '../../../../model';

/**
 * A mechanism which converts a {@link MowerServiceDataItem}.
 */
export interface GardenaActivityConverter {
    /**
     * Converts the item.
     * @param mower The mower service item.
     */
    convert(mower: MowerServiceDataItem): model.Activity;
}

export class GardenaActivityConverterImpl implements GardenaActivityConverter {
    public constructor(private log: PlatformLogger) { }
    
    public convert(mower: MowerServiceDataItem): model.Activity {
        switch (mower.attributes.activity.value) {
            case MowerActivity.OK_CHARGING:
                return model.Activity.CHARGING;

            case MowerActivity.OK_CUTTING:
            case MowerActivity.OK_CUTTING_TIMER_OVERRIDDEN:
            case MowerActivity.PAUSED:
                return model.Activity.MOWING;

            case MowerActivity.OK_LEAVING:
                return model.Activity.LEAVING_HOME;

            case MowerActivity.OK_SEARCHING:
                return model.Activity.GOING_HOME;

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
}