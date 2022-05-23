import { API, HAP, PlatformAccessory } from 'homebridge';
import { Service, Characteristic, CharacteristicEventTypes, CharacteristicValue, CharacteristicSetCallback } from 'hap-nodejs';
import { It, Mock, Times } from 'moq.ts';

import { MowerControlService } from '../../../src/services/automower/mowerControlService';
import { ScheduleServiceImpl } from '../../../src/services/homebridge/scheduleService';
import { AutomowerContext } from '../../../src/automowerAccessory';

describe('ScheduleServiceImpl', () => {
    let mowerControlService: Mock<MowerControlService>;
    let platformAccessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;

    let target: ScheduleServiceImpl;

    beforeEach(() => {
        mowerControlService = new Mock<MowerControlService>();
        platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();

        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object());

        target = new ScheduleServiceImpl(mowerControlService.object(), platformAccessory.object(), api.object());
    });

    it('should be initialized with existing service', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Schedule')).returns(service.object());

        target.init(true);

        c.verify(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>()), Times.Once());
    });
});