import { Characteristic } from 'hap-nodejs';
import { Localization } from '../../../primitives/localization';

export { Formats, Perms, Units } from 'hap-nodejs';

/**
 * An abstract {@link Characteristic} which supports resource localization.
 */
export abstract class LocalizedCharacteristic extends Characteristic {
    /**
     * Localizes the characteristic.
     * @param locale The localization.
     */
    public localize(locale: Localization): void {
        this.displayName = locale.format(this.displayName);

        if (this.props.description !== undefined) {
            this.props.description = locale.format(this.props.description);
        }

        if (this.props.unit !== undefined) {
            this.props.unit = locale.format(this.props.unit);
        }
    }
}