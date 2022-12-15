import { Characteristic, Formats, Perms } from 'hap-nodejs';

/**
 * Defines the minimum value for the cutting height characteristic.
 */
const MIN_CUTTING_HEIGHT = 1;

/**
 * Defines the maximum value for the cutting height characteristic.
 */
const MAX_CUTTING_HEIGHT = 9;

/**
 * Defines the step for the cutting height characteristic.
 */
const STEP_CUTTING_HEIGHT = 1;

/**
 * A characteristic which determines the cutting height of the mower.
 */
export class CuttingHeight extends Characteristic {
    public static readonly UUID = '536aa050-a419-4577-862e-d19a62bb04e1';

    public constructor() {
        super('Cutting Height', CuttingHeight.UUID, {
            format: Formats.UINT8,
            perms: [ Perms.PAIRED_READ, Perms.PAIRED_WRITE, Perms.NOTIFY ],
            minValue: MIN_CUTTING_HEIGHT,
            maxValue: MAX_CUTTING_HEIGHT,
            minStep: STEP_CUTTING_HEIGHT
        });
    }
}