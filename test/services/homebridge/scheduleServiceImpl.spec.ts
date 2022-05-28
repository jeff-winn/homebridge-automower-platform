import { API, HAP, Logging, PlatformAccessory } from 'homebridge';
import { Service, Characteristic, CharacteristicEventTypes, CharacteristicValue, CharacteristicSetCallback, HAPStatus } from 'hap-nodejs';
import { It, Mock, Times } from 'moq.ts';

import { MowerControlService } from '../../../src/services/automower/mowerControlService';
import { AutomowerContext } from '../../../src/automowerAccessory';
import { ScheduleServiceImplSpy } from './scheduleServiceImplSpy';
import { RestrictedReason } from '../../../src/model';
import { InvalidStateError } from '../../../src/errors/invalidStateError';

describe('ScheduleServiceImpl', () => {
    let mowerControlService: Mock<MowerControlService>;
    let platformAccessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<Logging>;

    let target: ScheduleServiceImplSpy;

    beforeEach(() => {
        mowerControlService = new Mock<MowerControlService>();
        platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();

        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object());
        log = new Mock<Logging>();        

        target = new ScheduleServiceImplSpy(mowerControlService.object(), platformAccessory.object(), api.object(), log.object());
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

    it('should resume the schedule', async () => {
        const mowerId = '12345';

        platformAccessory.setup(o => o.context).returns({
            manufacturer: 'HUSQVARNA',
            model: 'AUTOMOWER 430XH',
            serialNumber: '12345',
            mowerId: mowerId
        });

        mowerControlService.setup(o => o.resumeSchedule(mowerId)).returns(Promise.resolve(undefined));

        let status: Error | HAPStatus | null | undefined = undefined;
        await target.unsafeOnSet(true, (e) => {
            status = e;
        });

        mowerControlService.verify(o => o.resumeSchedule(mowerId), Times.Once());
        expect(status).toBe(HAPStatus.SUCCESS);
    });

    it('should park until further notice', async () => {
        const mowerId = '12345';

        platformAccessory.setup(o => o.context).returns({
            manufacturer: 'HUSQVARNA',
            model: 'AUTOMOWER 430XH',
            serialNumber: '12345',
            mowerId: mowerId
        });

        mowerControlService.setup(o => o.parkUntilFurtherNotice(mowerId)).returns(Promise.resolve(undefined));

        let status: Error | HAPStatus | null | undefined = undefined;
        await target.unsafeOnSet(false, (e) => {
            status = e;
        });

        mowerControlService.verify(o => o.parkUntilFurtherNotice(mowerId), Times.Once());
        expect(status).toBe(HAPStatus.SUCCESS);
    });

    it('should update the characteristic as true when scheduled to start', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Schedule')).returns(service.object());
        log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);

        target.init(true);

        target.setCalendar({
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: true,
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: true
                }
            ]
        });

        target.setPlanner({
            nextStartTimestamp: 12345,
            override: { },
            restrictedReason: RestrictedReason.WEEK_SCHEDULE
        });

        c.verify(o => o.updateValue(true), Times.Once());
    });

    it('should update the characteristic as false when planner is not scheduled to start', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Schedule')).returns(service.object());
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        target.init(true);

        target.setCalendar({
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: true,
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: true
                }
            ]
        });

        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
            restrictedReason: RestrictedReason.NOT_APPLICABLE
        });

        c.verify(o => o.updateValue(false), Times.Once());
    });

    it('should update the characteristic as false when calendar is not scheduled to start', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Schedule')).returns(service.object());
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        target.init(true);

        target.setCalendar({
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: false,
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false
                }
            ]
        });

        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
            restrictedReason: RestrictedReason.WEEK_SCHEDULE
        });

        c.verify(o => o.updateValue(false), Times.Once());
    });

    it('should update the characteristic as false when calendar and planner is not scheduled to start', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Schedule')).returns(service.object());
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        target.init(true);

        target.setCalendar({
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: false,
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false
                }
            ]
        });

        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
            restrictedReason: RestrictedReason.NOT_APPLICABLE
        });

        c.verify(o => o.updateValue(false), Times.Once());
    });
});