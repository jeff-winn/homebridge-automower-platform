import { API, Logging, PlatformAccessory } from 'homebridge';
import { Service, Characteristic, CharacteristicEventTypes, CharacteristicSetCallback, CharacteristicValue } from 'hap-nodejs';
import { It, Mock } from 'moq.ts';

import { AutomowerContext } from '../../../src/automowerAccessory';
import { SwitchServiceSpy } from './switchServiceSpy';

describe('AbstractSwitchService', () => {
    let name: string;
    let accessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;
    let log: Mock<Logging>;

    let target: SwitchServiceSpy;

    beforeEach(() => {
        name = 'Switch';
        accessory = new Mock<PlatformAccessory<AutomowerContext>>();
        api = new Mock<API>();
        log = new Mock<Logging>();

        api.setup(o => o.hap.Characteristic).returns(Characteristic);
        api.setup(o => o.hap.Service).returns(Service);

        target = new SwitchServiceSpy(name, accessory.object(), api.object(), log.object());
    });

    it('should return undefined when not initialized', () => {
        const result = target.getUnderlyingService();

        expect(result).toBeUndefined();
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
});