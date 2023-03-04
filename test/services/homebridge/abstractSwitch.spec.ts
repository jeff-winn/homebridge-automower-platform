import { Characteristic, CharacteristicEventTypes, CharacteristicSetCallback, CharacteristicValue, Service } from 'hap-nodejs';
import { API, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { MowerContext } from '../../../src/automowerAccessory';
import { PlatformLogger } from '../../../src/diagnostics/platformLogger';
import { MowerConnection } from '../../../src/model';
import { NameMode } from '../../../src/services/homebridge/abstractSwitch';
import { SwitchSpy } from './switchSpy';

describe('AbstractSwitch', () => {
    let name: string;
    let accessory: Mock<PlatformAccessory<MowerContext>>;
    let api: Mock<API>;
    let log: Mock<PlatformLogger>;

    let target: SwitchSpy;

    beforeEach(() => {
        name = 'Switch';
        accessory = new Mock<PlatformAccessory<MowerContext>>();
        api = new Mock<API>();
        log = new Mock<PlatformLogger>();

        api.setup(o => o.hap.Characteristic).returns(Characteristic);
        api.setup(o => o.hap.Service).returns(Service);

        target = new SwitchSpy(name, accessory.object(), api.object(), log.object());
    });

    it('should return undefined when not initialized', () => {
        const result = target.getUnderlyingService();

        expect(result).toBeUndefined();
    });
    
    it('should throw an error when not initialized', () => {
        expect(() => target.unsafeUpdateValue(true)).toThrowError();    
    });

    it('should initialize with the switch name', () => {
        const c = new Mock<Characteristic>();
        const statusActive = new Mock<Characteristic>();
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());

        const displayName = 'Hello';

        accessory.setup(o => o.displayName).returns(displayName);
        accessory.setup(o => o.getServiceById(Service.Switch, name)).returns(undefined);
        accessory.setup(o => o.addService(It.IsAny<Service>())).callback(({ args: [service]}) => {
            return service;
        });

        const service = new Mock<Service>();
        service.setup(o => o.setCharacteristic(Characteristic.ConfiguredName, displayName)).returns(service.object());
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());

        target.service = service.object();
        target.init(NameMode.DEFAULT);

        expect(target.serviceName).toBe(name);
    });

    it('should initialize with the accessory name', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());

        const statusActive = new Mock<Characteristic>();

        const displayName = 'Hello';

        accessory.setup(o => o.displayName).returns(displayName);
        accessory.setup(o => o.getServiceById(Service.Switch, name)).returns(undefined);
        accessory.setup(o => o.addService(It.IsAny<Service>())).callback(({ args: [service]}) => {
            return service;
        });

        const service = new Mock<Service>();
        service.setup(o => o.setCharacteristic(Characteristic.ConfiguredName, displayName)).returns(service.object());
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(false);
        service.setup(o => o.addCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());

        target.service = service.object();
        target.init(NameMode.DISPLAY_NAME);

        expect(target.serviceName).toBe(displayName);
    });

    it('should call set when callback is executed', async () => {
        await target.unsafeOnSetCallback(true, () => { 
            // Do nothing
        });

        expect(target.onSetCalled).toBeTruthy();
    });
    
    it('should create the service instance', () => {
        const displayName = 'hello world';

        const result = target.unsafeCreateService(displayName);

        expect(result).toBeDefined();
        expect(result.displayName).toBe(displayName);
    });

    it('should log the value when updated the first time to false', () => {
        const displayName = 'hello world';
        accessory.setup(o => o.displayName).returns(displayName);

        const c = new Mock<Characteristic>();
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        c.setup(o => o.updateValue(It.IsAny())).returns(c.object());

        const statusActive = new Mock<Characteristic>();

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());

        accessory.setup(o => o.getServiceById(Service.Switch, name)).returns(service.object());
        log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);

        target.init(NameMode.DEFAULT);
        target.unsafeUpdateValue(false);

        log.verify(o => o.info('CHANGED_VALUE', 'Switch', 'hello world', 'OFF'), Times.Once());
        c.verify(o => o.updateValue(false), Times.Once());
    });

    it('should log the value when changed from false to true', () => {
        const displayName = 'hello world';
        accessory.setup(o => o.displayName).returns(displayName);

        const c = new Mock<Characteristic>();
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        c.setup(o => o.updateValue(It.IsAny())).returns(c.object());

        const statusActive = new Mock<Characteristic>();

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());

        accessory.setup(o => o.getServiceById(Service.Switch, name)).returns(service.object());
        log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);

        target.init(NameMode.DEFAULT);
        target.unsafeUpdateValue(true);

        log.verify(o => o.info('CHANGED_VALUE', 'Switch', 'hello world', 'ON'), Times.Once());
        c.verify(o => o.updateValue(true), Times.Once());
    });

    it('should log the value when changed from true to false', () => {
        const displayName = 'hello world';
        accessory.setup(o => o.displayName).returns(displayName);

        const c = new Mock<Characteristic>();
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        c.setup(o => o.updateValue(It.IsAny())).returns(c.object());

        const statusActive = new Mock<Characteristic>();

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());

        accessory.setup(o => o.getServiceById(Service.Switch, name)).returns(service.object());
        log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);
        
        target.init(NameMode.DEFAULT);        
        target.unsafeSetLastValue(true);
        
        target.unsafeUpdateValue(false);

        log.verify(o => o.info('CHANGED_VALUE', 'Switch', 'hello world', 'OFF'), Times.Once());
        c.verify(o => o.updateValue(false), Times.Once());
    });

    it('should throw an error when not initialized on set mower metadata', () => {
        const metadata: MowerConnection = {
            connected: false
        };

        expect(() => target.setMowerConnection(metadata)).toThrowError();
    });
    
    it('should set active status to true when connected', () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const on = new Mock<Characteristic>();
        on.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(on.object());
        on.setup(o => o.updateValue(It.IsAny())).returns(on.object());

        const statusActive = new Mock<Characteristic>();
        statusActive.setup(o => o.updateValue(true)).returns(statusActive.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(on.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());
        accessory.setup(o => o.getServiceById(Service.Switch, 'Switch')).returns(service.object());

        target.init(NameMode.DEFAULT);
        target.setMowerConnection({
            connected: true
        });

        statusActive.verify(o => o.updateValue(true), Times.Once());
    });

    it('should set active status to false when not connected', () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const on = new Mock<Characteristic>();
        on.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(on.object());
        on.setup(o => o.updateValue(It.IsAny())).returns(on.object());

        const statusActive = new Mock<Characteristic>();
        statusActive.setup(o => o.updateValue(It.IsAny())).returns(statusActive.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(on.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());
        accessory.setup(o => o.getServiceById(Service.Switch, 'Switch')).returns(service.object());

        target.init(NameMode.DEFAULT);
        target.setMowerConnection({
            connected: false
        });

        statusActive.verify(o => o.updateValue(false), Times.Once());
    });
});