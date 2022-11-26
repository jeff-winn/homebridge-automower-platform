import { Formats, LocalizedCharacteristic, Perms } from './localizedCharacteristic';

/**
 * A characteristic for the number of charging cycles a mower has performed.
 */
export class ChargingCycles extends LocalizedCharacteristic {
    /**
     * Defines the UUID for the characteristic.
     */
    public static readonly UUID = 'e28ea134-47e2-49f0-895d-72dab38c9ab3';

    public constructor() { 
        super('CHARGING_CYCLES', ChargingCycles.UUID, {
            format: Formats.UINT32,
            perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
            unit: 'CYCLES',
            minValue: 0
        });
    }
}