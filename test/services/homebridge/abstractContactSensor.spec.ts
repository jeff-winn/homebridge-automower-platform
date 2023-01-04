import { Characteristic, Service } from 'hap-nodejs';
import { API, HAP, PlatformAccessory } from 'homebridge';

import { It, Mock, Times } from 'moq.ts';
import { AutomowerContext } from '../../../src/automowerAccessory';
import { MowerMetadata } from '../../../src/clients/automowerClient';
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

    it('should create a new service instance', () => {
        const result = target.unsafeCreateService('My Service');

        expect(result).toBeDefined();
    });

    it('should return undefined service when not initialized', () => {
        expect(target.getUnderlyingService()).toBeUndefined();
    });

    it('should throw an error when not initialized on set mower metadata', () => {
        const metadata: MowerMetadata = {
            connected: false,
            statusTimestamp: 1
        };

        expect(() => target.setMowerMetadata(metadata)).toThrowError();
    });
    
    it('should set active status to true when connected', () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const contactState = new Mock<Characteristic>();
        const statusActive = new Mock<Characteristic>();
        statusActive.setup(o => o.updateValue(true)).returns(statusActive.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.ContactSensorState)).returns(contactState.object());
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());
        platformAccessory.setup(o => o.getServiceById(Service.ContactSensor, 'Test')).returns(service.object());

        target.init();
        target.setMowerMetadata({
            connected: true,
            statusTimestamp: 1
        });

        statusActive.verify(o => o.updateValue(true), Times.Once());
    });

    it('should set active status to false when not connected', () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const contactState = new Mock<Characteristic>();
        const statusActive = new Mock<Characteristic>();
        statusActive.setup(o => o.updateValue(It.IsAny())).returns(statusActive.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.ContactSensorState)).returns(contactState.object());
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());
        platformAccessory.setup(o => o.getServiceById(Service.ContactSensor, 'Test')).returns(service.object());

        target.init();
        target.setMowerMetadata({
            connected: false,
            statusTimestamp: 1
        });

        statusActive.verify(o => o.updateValue(false), Times.Once());
    });
});