import { Characteristic, CharacteristicEventTypes, CharacteristicSetCallback, CharacteristicValue, HAPStatus, Service } from 'hap-nodejs';
import { API, HAP, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { AutomowerContext } from '../../src/automowerAccessory';
import { PlatformLogger } from '../../src/diagnostics/platformLogger';
import { Activity, Calendar, Mode, MowerState, Planner, RestrictedReason, State } from '../../src/model';
import { NameMode } from '../../src/services/abstractSwitch';
import { MowerControlService } from '../../src/services/husqvarna/automower/mowerControlService';
import { ScheduleEnabledPolicy } from '../../src/services/policies/scheduleEnabledPolicy';
import { ScheduleSwitchImplSpy } from './scheduleSwitchImplSpy';

describe('ScheduleSwitchImpl', () => {
    let mowerControlService: Mock<MowerControlService>;
    let platformAccessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<PlatformLogger>;
    let policy: Mock<ScheduleEnabledPolicy>;

    let target: ScheduleSwitchImplSpy;

    beforeEach(() => {
        mowerControlService = new Mock<MowerControlService>();
        platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();
        policy = new Mock<ScheduleEnabledPolicy>();

        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object());
        log = new Mock<PlatformLogger>();        

        target = new ScheduleSwitchImplSpy('Schedule', mowerControlService.object(), policy.object(), 
            platformAccessory.object(), api.object(), log.object());
    });

    it('should set the policy calendar', () => {
        const calendar: Calendar = {
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
        };

        policy.setup(o => o.shouldApply()).returns(false);
        policy.setup(o => o.setCalendar(calendar)).returns(undefined);

        target.setCalendar(calendar);

        policy.verify(o => o.setCalendar(calendar), Times.Once());
    });

    it('should set the policy mower state', () => {
        const mowerState: MowerState = {
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.HOME,
            state: State.NOT_APPLICABLE
        };

        policy.setup(o => o.shouldApply()).returns(false);
        policy.setup(o => o.setMowerState(mowerState)).returns(undefined);

        target.setMowerState(mowerState);

        policy.verify(o => o.setMowerState(mowerState), Times.Once());
    });

    it('should set the policy planner', () => {
        const planner: Planner = {
            nextStartTimestamp: 12345,
            override: { },
            restrictedReason: RestrictedReason.WEEK_SCHEDULE
        };

        policy.setup(o => o.shouldApply()).returns(false);
        policy.setup(o => o.setPlanner(planner)).returns(undefined);

        target.setPlanner(planner);

        policy.verify(o => o.setPlanner(planner), Times.Once());
    });

    it('should be initialized with existing service', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Schedule')).returns(service.object());

        target.init(NameMode.DEFAULT);

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

    it('should handle errors while resuming schedule', async () => {
        const mowerId = '12345';

        platformAccessory.setup(o => o.context).returns({
            manufacturer: 'HUSQVARNA',
            model: 'AUTOMOWER 430XH',
            serialNumber: '12345',
            mowerId: mowerId
        });

        mowerControlService.setup(o => o.resumeSchedule(mowerId)).throws(new Error('hello'));
        log.setup(o => o.error(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);

        let status: Error | HAPStatus | null | undefined = undefined;
        await target.unsafeOnSet(true, (e) => {
            status = e;
        });

        mowerControlService.verify(o => o.resumeSchedule(mowerId), Times.Once());
        log.verify(o => o.error(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()), Times.Once());
        expect(status).toBe(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    });

    it('should handle errors while parking until further notice', async () => {
        const mowerId = '12345';

        platformAccessory.setup(o => o.context).returns({
            manufacturer: 'HUSQVARNA',
            model: 'AUTOMOWER 430XH',
            serialNumber: '12345',
            mowerId: mowerId
        });

        mowerControlService.setup(o => o.parkUntilFurtherNotice(mowerId)).throws(new Error('hello'));
        log.setup(o => o.error(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);

        let status: Error | HAPStatus | null | undefined = undefined;
        await target.unsafeOnSet(false, (e) => {
            status = e;
        });

        mowerControlService.verify(o => o.parkUntilFurtherNotice(mowerId), Times.Once());
        log.verify(o => o.error(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()), Times.Once());
        expect(status).toBe(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    });

    it('should update the characteristic as true when scheduled to start', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        
        policy.setup(o => o.setPlanner(It.IsAny())).returns(undefined);
        policy.setup(o => o.setCalendar(It.IsAny())).returns(undefined);
        policy.setup(o => o.shouldApply()).returns(true);
        policy.setup(o => o.check()).returns(true);

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Schedule')).returns(service.object());
        log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);

        target.init(NameMode.DEFAULT);

        const calendar: Calendar = {
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
        };

        const planner: Planner = {
            nextStartTimestamp: 12345,
            override: { },
            restrictedReason: RestrictedReason.WEEK_SCHEDULE
        };

        target.setCalendar(calendar);
        target.setPlanner(planner);

        policy.verify(o => o.setCalendar(calendar), Times.Once());
        policy.verify(o => o.setPlanner(planner), Times.Once());
        c.verify(o => o.updateValue(true), Times.Once());
    });

    it('should update the characteristic as false when planner is not scheduled to start', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        
        policy.setup(o => o.setPlanner(It.IsAny())).returns(undefined);
        policy.setup(o => o.setCalendar(It.IsAny())).returns(undefined);
        policy.setup(o => o.shouldApply()).returns(true);
        policy.setup(o => o.check()).returns(false);

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Schedule')).returns(service.object());
        log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);

        target.init(NameMode.DEFAULT);
        target.unsafeSetLastValue(true);

        const calendar: Calendar = {
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
        };

        const planner: Planner = {
            nextStartTimestamp: 0,
            override: { },
            restrictedReason: RestrictedReason.NOT_APPLICABLE
        };

        target.setCalendar(calendar);
        target.setPlanner(planner);

        policy.verify(o => o.setCalendar(calendar), Times.Once());
        policy.verify(o => o.setPlanner(planner), Times.Once());
        c.verify(o => o.updateValue(false), Times.Once());
    });
});