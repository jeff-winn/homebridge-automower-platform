import { Perms } from 'homebridge';
import { Formats, LocalizedCharacteristic } from './localizedCharacteristic';

/**
 * A characteristic which determines the cutting height of the mower.
 */
export class CuttingHeight extends LocalizedCharacteristic {
    public static readonly UUID = '536aa050-a419-4577-862e-d19a62bb04e1';

    public constructor() {
        super('CUTTING_HEIGHT', CuttingHeight.UUID, {
            format: Formats.UINT8,
            perms: [ Perms.PAIRED_READ, Perms.NOTIFY ]
        });
    }
}