import { Formats, LocalizedCharacteristic, Perms, Units } from './localizedCharacteristic';

/**
 * A characteristic for the total number of seconds the mower has spent in the charging station.
 */
export class TotalChargingTime extends LocalizedCharacteristic {
    /**
     * Defines the UUID for the characteristic.
     */
    public static readonly UUID = 'd34cccf5-562a-44d6-9adf-e896d3cabf08';

    public constructor() {
        super('TOTAL_CHARGING_TIME', TotalChargingTime.UUID, {
            format: Formats.UINT32,
            perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
            unit: Units.SECONDS
        });
    }
}