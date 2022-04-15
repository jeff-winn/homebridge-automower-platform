import { API, HAP, Logging, PlatformAccessory } from 'homebridge';
import { Characteristic, Service } from 'hap-nodejs';
import { Mock, Times } from 'moq.ts';
import { AutomowerContext } from '../src/automowerAccessory';
import { AutomowerPlatform } from '../src/automowerPlatform';
import { AutomowerAccessorySpy } from './automowerAccessorySpy';

describe('automower accessory', () => {
    let service: typeof Service;
    let characteristic: typeof Characteristic;

    let platform: Mock<AutomowerPlatform>;
    let accessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<Logging>;

    let target: AutomowerAccessorySpy;

    beforeEach(() => {
        platform = new Mock<AutomowerPlatform>();
        accessory = new Mock<PlatformAccessory<AutomowerContext>>();
        api = new Mock<API>();
        hap = new Mock<HAP>();
        log = new Mock<Logging>();

        service = Service;
        characteristic = Characteristic;
        
        api.setup(x => x.hap).returns(hap.object());
        hap.setup(x => x.Characteristic).returns(characteristic);
        hap.setup(x => x.Service).returns(service);

        target = new AutomowerAccessorySpy(platform.object(), accessory.object(), api.object(), log.object());
    });

    it('should initialize all services', () => {
        target.shouldRun = false;

        target.init();

        expect(target.accessoryInformationInitialized).toBeTruthy();
    });

    it('initializes the accessory information correctly', () => {
        const serviceInstance = new Mock<Service>();
        
        const displayName = 'Bob';
        const mowerId = 'abcd1234';
        const manufacturer = 'manufacturer';
        const model = 'model';
        const serialNumber = '12345';

        accessory.setup(x => x.displayName).returns(displayName);
        accessory.setup(x => x.getService(service.AccessoryInformation)).returns(serviceInstance.object());
        accessory.setup(x => x.context).returns({
            mowerId: mowerId,
            manufacturer: manufacturer,
            model: model,
            serialNumber: serialNumber
        });

        serviceInstance.setup(x => x.setCharacteristic(characteristic.Manufacturer, manufacturer)).returns(serviceInstance.object());
        serviceInstance.setup(x => x.setCharacteristic(characteristic.Model, model)).returns(serviceInstance.object());
        serviceInstance.setup(x => x.setCharacteristic(characteristic.Name, displayName)).returns(serviceInstance.object());
        serviceInstance.setup(x => x.setCharacteristic(characteristic.SerialNumber, serialNumber)).returns(serviceInstance.object());

        target.unsafeInitAccessoryInformation();

        serviceInstance.verify(x => x.setCharacteristic(characteristic.Manufacturer, manufacturer), Times.Once());
        serviceInstance.verify(x => x.setCharacteristic(characteristic.Model, model), Times.Once());
        serviceInstance.verify(x => x.setCharacteristic(characteristic.Name, displayName), Times.Once());
        serviceInstance.verify(x => x.setCharacteristic(characteristic.SerialNumber, serialNumber), Times.Once());
    });

    it('returns the accessory uuid', () => {
        const uuid = '12345';

        accessory.setup(x => x.UUID).returns(uuid);

        const result = target.getUuid();
        expect(result).toBe(uuid);
    });
});