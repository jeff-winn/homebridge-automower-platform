import { ChargingCycles } from './characteristics/chargingCycles';
import { TotalChargingTime } from './characteristics/totalChargingTime';

/**
 * Defines the custom characteristic definitions available within the platform.
 */
export class CustomCharacteristicDefinitions {
    /**
     * The number of charging cycles.
     */
    public static readonly ChargingCycles = ChargingCycles;

    /**
     * The total time spent charging the device.
     */
    public static readonly TotalChargingTime = TotalChargingTime;
}