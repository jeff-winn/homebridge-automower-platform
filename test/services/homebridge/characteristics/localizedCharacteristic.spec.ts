import { Formats, Perms } from 'homebridge';
import { Mock } from 'moq.ts';
import { Localization } from '../../../../src/primitives/localization';
import { MockLocalizedCharacteristic } from './mockLocalizedCharacteristic';

describe('LocalizedCharacteristic', () => {
    const displayName = 'Hello';
    const uuid = '2d12b076-0881-42af-8b3e-54a89c7b5356';

    let locale: Mock<Localization>;

    beforeEach(() => {
        locale = new Mock<Localization>();
    });

    it('should localize the display name only', () => {
        const target = new MockLocalizedCharacteristic(displayName, uuid, {
            format: Formats.INT,
            perms: [ Perms.PAIRED_READ ]
        });

        const newDisplayName = 'world';
        locale.setup(o => o.format(displayName)).returns(newDisplayName);

        target.localize(locale.object());

        expect(target.displayName).toBe(newDisplayName);
    });

    it('should localize the display name and description', () => {
        const description = 'description';
        
        const target = new MockLocalizedCharacteristic(displayName, uuid, {
            format: Formats.INT,
            description: description,
            perms: [ Perms.PAIRED_READ ]
        });

        const newDisplayName = 'world';
        const newDescription = 'fancy description';

        locale.setup(o => o.format(displayName)).returns(newDisplayName);
        locale.setup(o => o.format(description)).returns(newDescription);

        target.localize(locale.object());

        expect(target.displayName).toBe(newDisplayName);
        expect(target.props.description).toBe(newDescription);        
    });

    it('should localize the display name description and cycles', () => {
        const description = 'description';
        const unit = 'cycles';
        
        const target = new MockLocalizedCharacteristic(displayName, uuid, {
            format: Formats.INT,
            perms: [ Perms.PAIRED_READ ],
            description: description,
            unit: unit
        });

        const newDisplayName = 'world';
        const newDescription = 'fancy description';
        const newUnit = 'fancy cycles';

        locale.setup(o => o.format(displayName)).returns(newDisplayName);
        locale.setup(o => o.format(description)).returns(newDescription);
        locale.setup(o => o.format(unit)).returns(newUnit);

        target.localize(locale.object());

        expect(target.displayName).toBe(newDisplayName);
        expect(target.props.description).toBe(newDescription);
        expect(target.props.unit).toBe(newUnit);
    });
});