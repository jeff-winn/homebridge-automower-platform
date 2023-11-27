import { Characteristic, Service } from 'hap-nodejs';
import { API, CharacteristicEventTypes, CharacteristicSetCallback, CharacteristicValue, HAP, HAPStatus, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { PlatformLogger } from '../../src/diagnostics/platformLogger';
import { Activity, MowerConnection, MowerSchedule, MowerState, State } from '../../src/model';
import { MowerContext } from '../../src/mowerAccessory';
import { NameMode } from '../../src/services/homebridge/abstractSwitch';
import { DISPLAY_NAME } from '../../src/services/homebridge/characteristics/cuttingHeight';
import { ChangeSettingsService } from '../../src/services/husqvarna/automower/changeSettingsService';
import { MowerControlService } from '../../src/services/husqvarna/mowerControlService';
import { SupportsCuttingHeightCharacteristic, SupportsMowerScheduleInformation, supportsCuttingHeight, supportsMowerSchedule } from '../../src/services/mainSwitch';
import { MowerIsEnabledPolicy } from '../../src/services/policies/mowerIsEnabledPolicy';
import { AutomowerMainSwitchImplSpy, MainSwitchImplSpy } from './mainSwitchImplSpy';

describe('supportsCuttingHeight', () => {
    it('should return an object supports cutting height', () => {
        const target = new Mock<SupportsCuttingHeightCharacteristic>();
        target.setup(o => o.setCuttingHeight(It.IsAny())).returns(undefined);

        expect(supportsCuttingHeight(target.object())).toBeTruthy();
    });

    it('should return an object does not support cutting height', () => {
        const target = new Mock<unknown>();
        expect(supportsCuttingHeight(target.object())).toBeFalsy();
    });
});

describe('supportsMowerSchedule', () => {
    it('should return an object supports mower schedule', () => {
        const target = new Mock<SupportsMowerScheduleInformation>();
        target.setup(o => o.setMowerSchedule(It.IsAny())).returns(undefined);

        expect(supportsMowerSchedule(target.object())).toBeTruthy();
    });

    it('should return an object does not support mower schedule', () => {
        const target = new Mock<unknown>();
        expect(supportsMowerSchedule(target.object())).toBeFalsy();
    });
});

describe('MainSwitchImpl', () => {
    let mowerControlService: Mock<MowerControlService>;
    let platformAccessory: Mock<PlatformAccessory<MowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<PlatformLogger>;
    let policy: Mock<MowerIsEnabledPolicy & SupportsMowerScheduleInformation>;

    let target: MainSwitchImplSpy;

    beforeEach(() => {
        mowerControlService = new Mock<MowerControlService>();

        platformAccessory = new Mock<PlatformAccessory<MowerContext>>();
        policy = new Mock<MowerIsEnabledPolicy & SupportsMowerScheduleInformation>();

        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object());
        log = new Mock<PlatformLogger>();        

        target = new MainSwitchImplSpy('Schedule', mowerControlService.object(), policy.object(),
            platformAccessory.object(), api.object(), log.object());
    });

    it('should return true when supports cutting height characteristic', () => {
        const t = new Mock<SupportsCuttingHeightCharacteristic>();
        t.setup(o => o.setCuttingHeight(It.IsAny())).returns(undefined);

        expect(supportsCuttingHeight(t.object())).toBeTruthy();
    });

    it('should return false when does not support cutting height characteristic', () => {
        const t = {
            hello: 'true'
        };

        expect(supportsCuttingHeight(t)).toBeFalsy();
    });

    it('should return true when supports mower schedule', () => {
        const t = new Mock<SupportsMowerScheduleInformation>();
        t.setup(o => o.setMowerSchedule(It.IsAny())).returns(undefined);

        expect(supportsMowerSchedule(t.object())).toBeTruthy();
    });

    it('should return false when does not support mower schedule', () => {
        const t = {
            hello: 'true'
        };

        expect(supportsMowerSchedule(t)).toBeFalsy();
    });

    it('should set the policy mower state', () => {
        const mowerState: MowerState = {
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        };

        policy.setup(o => o.shouldApply()).returns(false);
        policy.setup(o => o.setMowerState(mowerState)).returns(undefined);

        target.setMowerState(mowerState);

        policy.verify(o => o.setMowerState(mowerState), Times.Once());
    });
    
    it('should not set the policy mower schedule when unsupported', () => {
        const schedule: MowerSchedule = {
            runContinuously: true,
            runInFuture: true,
            runOnSchedule: true
        };

        policy.setup(o => o.shouldApply()).returns(false);

        target.setMowerSchedule(schedule);

        policy.verify(o => o.setMowerSchedule(schedule), Times.Never());
    });

    it('should set the policy mower schedule', () => {
        const schedule: MowerSchedule = {
            runContinuously: true,
            runInFuture: true,
            runOnSchedule: true
        };

        policy.setup(o => o.shouldApply()).returns(false);
        policy.setup(o => o.setMowerSchedule(schedule)).returns(undefined);

        target.setMowerSchedule(schedule);

        policy.verify(o => o.setMowerSchedule(schedule), Times.Once());
    });

    it('should be initialized with existing service', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());

        const statusActive = new Mock<Characteristic>();

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());
        service.setup(o => o.testCharacteristic(DISPLAY_NAME)).returns(true);

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

        mowerControlService.setup(o => o.resumeAsync(mowerId)).returns(Promise.resolve(undefined));

        let status: Error | HAPStatus | null | undefined = undefined;
        await target.unsafeOnSetCallbackAsync(true, (e) => {
            status = e;
        });

        mowerControlService.verify(o => o.resumeAsync(mowerId), Times.Once());
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

        mowerControlService.setup(o => o.parkUntilFurtherNoticeAsync(mowerId)).returns(Promise.resolve(undefined));

        let status: Error | HAPStatus | null | undefined = undefined;
        await target.unsafeOnSetCallbackAsync(false, (e) => {
            status = e;
        });

        mowerControlService.verify(o => o.parkUntilFurtherNoticeAsync(mowerId), Times.Once());
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

        mowerControlService.setup(o => o.resumeAsync(mowerId)).throws(new Error('hello'));
        log.setup(o => o.error(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);

        let status: Error | HAPStatus | null | undefined = undefined;
        target.unsafeOnSetCallback(true, (e) => {
            status = e;
        });

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);

        mowerControlService.verify(o => o.resumeAsync(mowerId), Times.Once());
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

        mowerControlService.setup(o => o.parkUntilFurtherNoticeAsync(mowerId)).throws(new Error('hello'));
        log.setup(o => o.error(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);

        let status: Error | HAPStatus | null | undefined = undefined;
        target.unsafeOnSetCallback(false, (e) => {
            status = e;
        });

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);

        mowerControlService.verify(o => o.parkUntilFurtherNoticeAsync(mowerId), Times.Once());
        log.verify(o => o.error(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()), Times.Once());
        expect(status).toBe(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    });

    it('should throw an error when not initialized on set mower connection', () => {
        const connection: MowerConnection = {
            connected: false
        };

        expect(() => target.setMowerConnection(connection)).toThrowError();
    });
});

describe('AutomowerMainSwitchImpl', () => {
    let mowerControlService: Mock<MowerControlService>;
    let changeSettingsService: Mock<ChangeSettingsService>;
    let platformAccessory: Mock<PlatformAccessory<MowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<PlatformLogger>;
    let policy: Mock<MowerIsEnabledPolicy>;

    let target: AutomowerMainSwitchImplSpy;

    beforeEach(() => {
        mowerControlService = new Mock<MowerControlService>();
        changeSettingsService = new Mock<ChangeSettingsService>();

        platformAccessory = new Mock<PlatformAccessory<MowerContext>>();
        policy = new Mock<MowerIsEnabledPolicy>();

        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object());
        log = new Mock<PlatformLogger>();        

        target = new AutomowerMainSwitchImplSpy('Schedule', mowerControlService.object(), changeSettingsService.object(), policy.object(),
            platformAccessory.object(), api.object(), log.object());
    });

    it('should be initialized with existing service', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());

        const cuttingHeight = new Mock<Characteristic>();
        cuttingHeight.setup(o => o.on(CharacteristicEventTypes.SET,
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(cuttingHeight.object());

        const statusActive = new Mock<Characteristic>();

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());
        service.setup(o => o.testCharacteristic(DISPLAY_NAME)).returns(true);
        service.setup(o => o.getCharacteristic(DISPLAY_NAME)).returns(cuttingHeight.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Schedule')).returns(service.object());

        target.init(NameMode.DEFAULT);

        c.verify(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>()), Times.Once());
        cuttingHeight.verify(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>()), Times.Once());
    });

    it('should set the cutting height', async () => {
        const mowerId = '12345';
        const cuttingHeight = 1;

        platformAccessory.setup(o => o.context).returns({
            manufacturer: 'HUSQVARNA',
            model: 'AUTOMOWER 430XH',
            serialNumber: '12345',
            mowerId: mowerId
        });

        changeSettingsService.setup(o => o.changeCuttingHeight(mowerId, cuttingHeight)).returns(Promise.resolve(undefined));

        let status: Error | HAPStatus | null | undefined = undefined;
        await target.unsafeSetCuttingHeightCallbackAsync(cuttingHeight, (e) => {
            status = e;
        });

        changeSettingsService.verify(o => o.changeCuttingHeight(mowerId, cuttingHeight), Times.Once());
        expect(status).toBe(HAPStatus.SUCCESS);
    });

    it('should handle errors while changing the cutting height', async () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        
        const cuttingHeight = new Mock<Characteristic>();
        cuttingHeight.setup(o => o.displayName).returns(DISPLAY_NAME);
        cuttingHeight.setup(o => o.on(CharacteristicEventTypes.SET,
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(cuttingHeight.object());
    
        const statusActive = new Mock<Characteristic>();
        
        policy.setup(o => o.shouldApply()).returns(true);
        policy.setup(o => o.check()).returns(false);

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());
        service.setup(o => o.testCharacteristic(DISPLAY_NAME)).returns(true);
        service.setup(o => o.getCharacteristic(DISPLAY_NAME)).returns(cuttingHeight.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Schedule')).returns(service.object());
        log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);

        target.init(NameMode.DEFAULT);

        const mowerId = '12345';
        const cuttingHeightValue = 1;
        const displayName = 'Dobby';

        platformAccessory.setup(o => o.displayName).returns(displayName);
        platformAccessory.setup(o => o.context).returns({
            manufacturer: 'HUSQVARNA',
            model: 'AUTOMOWER 430XH',
            serialNumber: '12345',
            mowerId: mowerId
        });

        changeSettingsService.setup(o => o.changeCuttingHeight(mowerId, cuttingHeightValue)).throws(new Error('hello'));
        log.setup(o => o.error(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);

        let status: Error | HAPStatus | null | undefined = undefined;
        target.unsafeOnSetCuttingHeightCallback(cuttingHeightValue, (e) => {
            status = e;
        });

        // Required to cause the async function to execute.
        await new Promise(process.nextTick);

        changeSettingsService.verify(o => o.changeCuttingHeight(mowerId, cuttingHeightValue), Times.Once());
        log.verify(o => o.error(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()), Times.Once());
        expect(status).toBe(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    });

    it('should throw an error when setting the cutting height and not initialized', () => {
        expect(() => target.setCuttingHeight(1)).toThrowError();
    });
    
    it('should update the cutting height', () => {
        const c = new Mock<Characteristic>();
        c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        
        const cuttingHeight = new Mock<Characteristic>();
        cuttingHeight.setup(o => o.displayName).returns(DISPLAY_NAME);
        cuttingHeight.setup(o => o.updateValue(It.IsAny())).returns(cuttingHeight.object());
        cuttingHeight.setup(o => o.on(CharacteristicEventTypes.SET,
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(cuttingHeight.object());
    
        const statusActive = new Mock<Characteristic>();
        
        policy.setup(o => o.shouldApply()).returns(true);
        policy.setup(o => o.check()).returns(false);

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());
        service.setup(o => o.testCharacteristic(DISPLAY_NAME)).returns(true);
        service.setup(o => o.getCharacteristic(DISPLAY_NAME)).returns(cuttingHeight.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Schedule')).returns(service.object());
        log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);

        target.init(NameMode.DEFAULT);
        target.setCuttingHeight(1);

        cuttingHeight.verify(o => o.updateValue(1), Times.Once());
        log.verify(o => o.info(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()), Times.Once());
    });
});