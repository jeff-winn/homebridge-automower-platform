import * as model from '../../../../model';

import { Mower, State } from '../../../../clients/automower/automowerClient';
import { PlatformLogger } from '../../../../diagnostics/platformLogger';

/**
 * A mechanism which converts a {@link Mower}.
 */
export interface AutomowerStateConverter {
    /**
     * Converts the item.
     * @param mower The mower service item.
     */
    convert(mower: Mower): model.State;
}

export class AutomowerStateConverterImpl implements AutomowerStateConverter {
    public constructor(private log: PlatformLogger) { }

    public convert(mower: Mower): model.State {
        if (mower.attributes.mower.state === State.STOPPED && mower.attributes.mower.errorCode !== 0) {
            return model.State.TAMPERED;
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