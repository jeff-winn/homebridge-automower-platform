import { Characteristic, Service } from 'hap-nodejs';
import { API, HAP, PlatformAccessory } from 'homebridge';
import { Mock } from 'moq.ts';

import { MowerContext } from '../../../src/mowerAccessory';
import { AccessoryServiceSpy } from './accessoryServiceSpy';

describe('AbstractAccessoryService', () => {    
    it('must be able to construct the object correctly', () => {
        const accessory = new Mock<PlatformAccessory<MowerContext>>();

        const hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);

        const api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object());

        const target = new AccessoryServiceSpy(accessory.object(), api.object());

        expect(target.getServiceType()).toBe(Service);
        expect(target.getCharacteristicType()).toBe(Characteristic);
    });
});