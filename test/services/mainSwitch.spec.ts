import { Characteristic, Service } from 'hap-nodejs';
import { API, CharacteristicEventTypes, CharacteristicSetCallback, CharacteristicValue, HAP, HAPStatus, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { PlatformLogger } from '../../src/diagnostics/platformLogger';
import { Activity, MowerConnection, MowerState, State } from '../../src/model';
import { MowerContext } from '../../src/mowerAccessory';
import { NameMode } from '../../src/services/homebridge/abstractSwitch';
import { DISPLAY_NAME } from '../../src/services/homebridge/characteristics/cuttingHeight';
import { ChangeSettingsService } from '../../src/services/husqvarna/automower/changeSettingsService';
import { MowerControlService } from '../../src/services/husqvarna/mowerControlService';
import { MowerIsEnabledPolicy } from '../../src/services/policies/mowerIsEnabledPolicy';
import { AutomowerMainSwitchImplSpy, MainSwitchImplSpy } from './mainSwitchImplSpy';

describe('MainSwitchImpl', () => {
    let mowerControlService: Mock<MowerControlService>;
    let platformAccessory: Mock<PlatformAccessory<MowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<PlatformLogger>;
    let policy: Mock<MowerIsEnabledPolicy>;

    let target: MainSwitchImplSpy;

    beforeEach(() => {
        mowerControlService = new Mock<MowerControlService>();

        platformAccessory = new Mock<PlatformAccessory<MowerContext>>();
        policy = new Mock<MowerIsEnabledPolicy>();

        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object());
        log = new Mock<PlatformLogger>();        

        target = new MainSwitchImplSpy('Schedule', mowerControlService.object(), policy.object(),
            platformAccessory.object(), api.object(), log.object());
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
        await target.unsafeSetCuttingHeight(cuttingHeight, (e) => {
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
        await target.unsafeSetCuttingHeight(cuttingHeightValue, (e) => {
            status = e;
        });

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