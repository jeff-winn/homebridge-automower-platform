import { Characteristic, Formats, Perms } from 'hap-nodejs';
import { API, HAP, Service } from 'homebridge';
import { It, Mock } from 'moq.ts';

import { attachCuttingHeightCharacteristic, DISPLAY_NAME, UUID } from '../../../../src/services/homebridge/characteristics/cuttingHeight';

describe('attachCuttingHeightCharacteristic', () => {
    let api: Mock<API>;
    let hap: Mock<HAP>;
    
    let target: Mock<Service>;    

    beforeEach(() => {
        hap = new Mock<HAP>();
        hap.setup(o => o.Characteristic).returns(Characteristic);

        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object());

        target = new Mock<Service>();
    });

    it('should return the existing instance', () => {
        const c = new Mock<Characteristic>();

        target.setup(o => o.testCharacteristic(It.IsAny())).returns(true);
        target.setup(o => o.getCharacteristic(It.IsAny())).returns(c.object());
        
        const result = attachCuttingHeightCharacteristic(target.object(), api.object());

        expect(result).toBe(c.object());
    });

    it('should attach a new instance', () => {
        target.setup(o => o.testCharacteristic(It.IsAny())).returns(false);
        target.setup(o => o.addCharacteristic(It.IsAny())).callback(({ args: [chr]}) => {
            return chr;
        });
        
        const result = attachCuttingHeightCharacteristic(target.object(), api.object());

        expect(result).toBeDefined();
        expect(result.displayName).toBe(DISPLAY_NAME);
        expect(result.UUID).toBe(UUID);
        
        expect(result.props.format).toBe(Formats.UINT8);
        expect(result.props.perms).toContain(Perms.PAIRED_READ);
        expect(result.props.perms).toContain(Perms.PAIRED_WRITE);
        expect(result.props.perms).toContain(Perms.NOTIFY);
        expect(result.props.minStep).toBe(1);
        expect(result.props.minValue).toBe(1);
        expect(result.props.maxValue).toBe(9);
    });
});