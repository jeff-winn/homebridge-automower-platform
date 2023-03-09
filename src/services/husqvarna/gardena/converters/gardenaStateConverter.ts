import { MowerActivity, MowerError, MowerServiceDataItem, ServiceState } from '../../../../clients/gardena/gardenaClient';
import { PlatformLogger } from '../../../../diagnostics/platformLogger';

import * as model from '../../../../model';

/**
 * A mechanism which converts a {@link MowerServiceDataItem}.
 */
export interface GardenaStateConverter {
        /**
     * Converts the item.
     * @param mower The mower service item.
     */
    convert(mower: MowerServiceDataItem): model.State;
}

export class GardenaStateConverterImpl implements GardenaStateConverter {
    public constructor(private log: PlatformLogger) { }

    public convert(mower: MowerServiceDataItem): model.State {
        if (mower.attributes.activity.value === MowerActivity.PAUSED) {
            return model.State.PAUSED;
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
                switch (mower.attributes.state.value) {
                    case ServiceState.OK:
                        return model.State.READY;
        
                    case ServiceState.WARNING:
                    case ServiceState.ERROR:
                        return model.State.FAULTED;
        
                    case ServiceState.UNAVAILABLE:
                        return model.State.UNKNOWN;

                    default:
                        return model.State.UNKNOWN;
                }
        }
    }
}