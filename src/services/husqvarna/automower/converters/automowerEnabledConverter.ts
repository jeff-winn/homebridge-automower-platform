import { Mower } from '../../../../clients/automower/automowerClient';
import { PlatformLogger } from '../../../../diagnostics/platformLogger';


/**
 * A mechanism which converts a {@link Mower}.
 */
export interface AutomowerEnabledConverter {
    /**
     * Converts the item.
     * @param mower The mower service item.
     */
    convert(mower: Mower): boolean;
}

export class AutomowerEnabledConverterImpl implements AutomowerEnabledConverter {
    public constructor(private log: PlatformLogger) { }

    public convert(mower: Mower): boolean {
        // TODO: Fix this.
        return true;
    }
}