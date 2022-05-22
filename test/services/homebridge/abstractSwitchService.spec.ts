import { API, PlatformAccessory } from 'homebridge';
import { Service, Characteristic } from 'hap-nodejs';
import { Mock } from 'moq.ts';

import { AutomowerContext } from '../../../src/automowerAccessory';
import { SwitchServiceSpy } from './switchServiceSpy';

describe('AbstractSwitchService', () => {
    let name: string;
    let accessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;

    let target: SwitchServiceSpy;

    beforeEach(() => {
        name = 'hello';
        accessory = new Mock<PlatformAccessory<AutomowerContext>>();
        api = new Mock<API>();

        api.setup(o => o.hap.Characteristic).returns(Characteristic);
        api.setup(o => o.hap.Service).returns(Service);

        target = new SwitchServiceSpy(name, accessory.object(), api.object());
    });

    it('should return undefined when not initialized', () => {
        const result = target.getUnderlyingService();

        expect(result).toBeUndefined();
    });
});