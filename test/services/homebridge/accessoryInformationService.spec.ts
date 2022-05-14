import { API, HAP, PlatformAccessory } from 'homebridge';
import { Characteristic, Service } from 'hap-nodejs';
import { Mock, Times } from 'moq.ts';

import { AutomowerContext } from '../../../src/automowerAccessory';
import { AccessoryInformationServiceImpl } from '../../../src/services/homebridge/accessoryInformationService';

describe('AccessoryInformationService', () => {
    let accessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;

    let target: AccessoryInformationServiceImpl;

    beforeEach(() => {
        accessory = new Mock<PlatformAccessory<AutomowerContext>>();
        api = new Mock<API>();
        hap = new Mock<HAP>();

        api.setup(x => x.hap).returns(hap.object());
        hap.setup(x => x.Characteristic).returns(Characteristic);
        hap.setup(x => x.Service).returns(Service);
        
        target = new AccessoryInformationServiceImpl(accessory.object(), api.object());
    });

    it('should return undefined when not initialized', () => {
        const result = target.getUnderlyingService();

        expect(result).toBeUndefined();
    });

    it('initializes the accessory information adding the service instance', () => {
        const serviceInstance = new Mock<Service>();
        
        const displayName = 'Bob';
        const mowerId = 'abcd1234';
        const manufacturer = 'manufacturer';
        const model = 'model';
        const serialNumber = '12345';

        accessory.setup(x => x.displayName).returns(displayName);
        accessory.setup(x => x.getService(Service.AccessoryInformation)).returns(undefined);
        accessory.setup(x => x.addService(Service.AccessoryInformation)).returns(serviceInstance.object());
        accessory.setup(x => x.context).returns({
            mowerId: mowerId,
            manufacturer: manufacturer,
            model: model,
            serialNumber: serialNumber
        });

        serviceInstance.setup(x => x.setCharacteristic(Characteristic.Manufacturer, manufacturer)).returns(serviceInstance.object());
        serviceInstance.setup(x => x.setCharacteristic(Characteristic.Model, model)).returns(serviceInstance.object());
        serviceInstance.setup(x => x.setCharacteristic(Characteristic.Name, displayName)).returns(serviceInstance.object());
        serviceInstance.setup(x => x.setCharacteristic(Characteristic.SerialNumber, serialNumber)).returns(serviceInstance.object());

        target.init();

        serviceInstance.verify(x => x.setCharacteristic(Characteristic.Manufacturer, manufacturer), Times.Once());
        serviceInstance.verify(x => x.setCharacteristic(Characteristic.Model, model), Times.Once());
        serviceInstance.verify(x => x.setCharacteristic(Characteristic.Name, displayName), Times.Once());
        serviceInstance.verify(x => x.setCharacteristic(Characteristic.SerialNumber, serialNumber), Times.Once());

        // Make sure the service has been initialized.
        const result = target.getUnderlyingService();
        expect(result).toBe(serviceInstance.object());
    });

    it('initializes the accessory information for existing service instance', () => {
        const serviceInstance = new Mock<Service>();
        
        const displayName = 'Bob';
        const mowerId = 'abcd1234';
        const manufacturer = 'manufacturer';
        const model = 'model';
        const serialNumber = '12345';

        accessory.setup(x => x.displayName).returns(displayName);
        accessory.setup(x => x.getService(Service.AccessoryInformation)).returns(serviceInstance.object());
        accessory.setup(x => x.context).returns({
            mowerId: mowerId,
            manufacturer: manufacturer,
            model: model,
            serialNumber: serialNumber
        });

        serviceInstance.setup(x => x.setCharacteristic(Characteristic.Manufacturer, manufacturer)).returns(serviceInstance.object());
        serviceInstance.setup(x => x.setCharacteristic(Characteristic.Model, model)).returns(serviceInstance.object());
        serviceInstance.setup(x => x.setCharacteristic(Characteristic.Name, displayName)).returns(serviceInstance.object());
        serviceInstance.setup(x => x.setCharacteristic(Characteristic.SerialNumber, serialNumber)).returns(serviceInstance.object());

        target.init();

        serviceInstance.verify(x => x.setCharacteristic(Characteristic.Manufacturer, manufacturer), Times.Once());
        serviceInstance.verify(x => x.setCharacteristic(Characteristic.Model, model), Times.Once());
        serviceInstance.verify(x => x.setCharacteristic(Characteristic.Name, displayName), Times.Once());
        serviceInstance.verify(x => x.setCharacteristic(Characteristic.SerialNumber, serialNumber), Times.Once());

        // Make sure the service has been initialized.
        const result = target.getUnderlyingService();
        expect(result).toBe(serviceInstance.object());        
    });
});