import * as model from '../../../../model';

import { Activity, Mower } from '../../../../clients/automower/automowerClient';
import { PlatformLogger } from '../../../../diagnostics/platformLogger';

/**
 * A mechanism which converts a {@link Mower}.
 */
export interface AutomowerActivityConverter {
    /**
     * Converts the item.
     * @param mower The mower service item.
     */
    convert(mower: Mower): model.Activity;
}

export class AutomowerActivityConverterImpl implements AutomowerActivityConverter {
    public constructor(private log: PlatformLogger) { }

    public convert(mower: Mower): model.Activity {
        switch (mower.attributes.mower.activity) {
            case Activity.CHARGING:
                return model.Activity.CHARGING;
                
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
}