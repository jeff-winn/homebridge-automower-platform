import { API, Characteristic, Formats, Perms, Service } from 'homebridge';

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
 * Defines the display name of the characteristic.
 */
export const DISPLAY_NAME = 'Cutting Height';

/**
 * Defines the UUID of the characteristic.
 */
export const UUID = '536aa050-a419-4577-862e-d19a62bb04e1';

/**
 * Attaches the 'Cutting Height' characteristic to the service.
 * @param target The service to which the characteristic should be attached.
 * @param api The Homebridge {@link API} instance in use for the plug-in.
 * @returns The {@link Characteristic} instance.
 */
export function attachCuttingHeightCharacteristic(target: Service, api: API): Characteristic {
    let result: Characteristic;

    if (target.testCharacteristic(DISPLAY_NAME)) {
        result = target.getCharacteristic(DISPLAY_NAME)!;
    } else {
        result = target.addCharacteristic(new api.hap.Characteristic(DISPLAY_NAME, UUID, {
            format: Formats.UINT8,
            perms: [ Perms.PAIRED_READ, Perms.PAIRED_WRITE, Perms.NOTIFY ],
            minValue: MIN_CUTTING_HEIGHT,
            maxValue: MAX_CUTTING_HEIGHT,
            minStep: STEP_CUTTING_HEIGHT
        }));
    }

    return result;
}