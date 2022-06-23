import { API, PlatformAccessory } from 'homebridge';
import { Service, Characteristic, CharacteristicEventTypes, CharacteristicSetCallback, CharacteristicValue } from 'hap-nodejs';
import { It, Mock, Times } from 'moq.ts';

import { AutomowerContext } from '../../src/automowerAccessory';
import { SwitchSpy } from './switchSpy';
import { InvalidStateError } from '../../src/errors/invalidStateError';
import { PlatformLogger } from '../../src/diagnostics/platformLogger';

describe('AbstractSwitch', () => {
    let name: string;
    let accessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;
    let log: Mock<PlatformLogger>;

    let target: SwitchSpy;

    beforeEach(() => {
        name = 'Switch';
        accessory = new Mock<PlatformAccessory<AutomowerContext>>();
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
        let thrown = false;

        try {
            target.unsafeUpdateValue(true);
        } catch(e) {
            if (e instanceof InvalidStateError) {
                thrown = true;
            } else {
                throw e;
            }
        }

        expect(thrown).toBeTruthy();
    });

    it('should initialize without the name prepended', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());

        const displayName = 'Hello';

        accessory.setup(o => o.displayName).returns(displayName);
        accessory.setup(o => o.getServiceById(Service.Switch, name)).returns(undefined);
        accessory.setup(o => o.addService(It.IsAny<Service>())).callback(({ args: [service]}) => {
            return service;
        });

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());

        target.service = service.object();
        target.init(false);

        expect(target.serviceName).toBe(name);
    });

    it('should initialize with the name prepended', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());

        const displayName = 'Hello';

        accessory.setup(o => o.displayName).returns(displayName);
        accessory.setup(o => o.getServiceById(Service.Switch, name)).returns(undefined);
        accessory.setup(o => o.addService(It.IsAny<Service>())).callback(({ args: [service]}) => {
            return service;
        });

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());

        target.service = service.object();
        target.init(true);

        expect(target.serviceName).toBe(`${displayName} ${name}`);
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

    it('should log the value when changed from false to true', () => {
        const displayName = 'hello world';
        accessory.setup(o => o.displayName).returns(displayName);

        const c = new Mock<Characteristic>();
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        c.setup(o => o.updateValue(It.IsAny())).returns(c.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());

        accessory.setup(o => o.getServiceById(Service.Switch, name)).returns(service.object());
        log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);

        target.init(false);
        target.unsafeUpdateValue(true);

        log.verify(o => o.info('Changed \'%s\' for \'%s\': ON', 'Switch', 'hello world'), Times.Once());
        c.verify(o => o.updateValue(true), Times.Once());
    });

    it('should log the value when changed from true to false', () => {
        const displayName = 'hello world';
        accessory.setup(o => o.displayName).returns(displayName);

        const c = new Mock<Characteristic>();
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        c.setup(o => o.updateValue(It.IsAny())).returns(c.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());

        accessory.setup(o => o.getServiceById(Service.Switch, name)).returns(service.object());
        log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);
        
        target.init(false);        
        target.unsafeSetLastValue(true);
        
        target.unsafeUpdateValue(false);

        log.verify(o => o.info('Changed \'%s\' for \'%s\': OFF', 'Switch', 'hello world'), Times.Once());
        c.verify(o => o.updateValue(false), Times.Once());
    });
});