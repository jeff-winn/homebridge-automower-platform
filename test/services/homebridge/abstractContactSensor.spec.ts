import { Characteristic, Service } from 'hap-nodejs';
import { API, HAP, PlatformAccessory } from 'homebridge';

import { Mock } from 'moq.ts';
import { AutomowerContext } from '../../../src/automowerAccessory';
import { PlatformLogger } from '../../../src/diagnostics/platformLogger';
import { Policy } from '../../../src/services/policies/policy';
import { ContactSensorSpy } from './contactSensorSpy';

describe('AbstractContactSensor', () => {
    let policy: Mock<Policy>;
    let platformAccessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<PlatformLogger>;
    let target: ContactSensorSpy;

    beforeEach(() => {
        policy = new Mock<Policy>();

        platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();
        log = new Mock<PlatformLogger>();
        
        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object()); 

        target = new ContactSensorSpy('Test', policy.object(), platformAccessory.object(), api.object(), log.object());
    });

    it('should return undefined service when not initialized', () => {
        expect(target.getUnderlyingService()).toBeUndefined();
    });
});