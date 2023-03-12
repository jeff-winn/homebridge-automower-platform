import { Characteristic, HAPStatus, Service } from 'hap-nodejs';
import { API, CharacteristicEventTypes, CharacteristicSetCallback, CharacteristicValue, HAP, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { MowerContext } from '../../src/automowerAccessory';
import { PlatformLogger } from '../../src/diagnostics/platformLogger';
import { Activity, MowerConnection, MowerState, State } from '../../src/model';
import { NameMode } from '../../src/services/homebridge/abstractSwitch';
import { MowerControlService } from '../../src/services/husqvarna/mowerControlService';
import { MowerIsPausedPolicy } from '../../src/services/policies/mowerIsPausedPolicy';
import { PauseSwitchImplSpy } from './pauseSwitchImplSpy';

describe('PauseSwitchImpl', () => {
    let controlService: Mock<MowerControlService>;
    let policy: Mock<MowerIsPausedPolicy>;

    let platformAccessory: Mock<PlatformAccessory<MowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<PlatformLogger>;
    
    let target: PauseSwitchImplSpy; 

    beforeEach(() => {
        controlService = new Mock<MowerControlService>();
        policy = new Mock<MowerIsPausedPolicy>();

        platformAccessory = new Mock<PlatformAccessory<MowerContext>>();
        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object());
        log = new Mock<PlatformLogger>();        

        target = new PauseSwitchImplSpy('Pause', controlService.object(), policy.object(),
            platformAccessory.object(), api.object(), log.object());
    });

    it('should pause the mower', async () => {
        const mowerId = '12345';

        platformAccessory.setup(o => o.context).returns({
            manufacturer: 'HUSQVARNA',
            model: 'AUTOMOWER 430XH',
            serialNumber: '12345',
            mowerId: mowerId
        });

        controlService.setup(o => o.pause(mowerId)).returns(Promise.resolve(undefined));

        let status: Error | HAPStatus | null | undefined = undefined;
        await target.unsafeOnSet(true, (e) => {
            status = e;
        });

        controlService.verify(o => o.pause(mowerId), Times.Once());
        expect(status).toBe(HAPStatus.SUCCESS);
    });

    it('should resume the mower schedule', async () => {
        const mowerId = '12345';

        platformAccessory.setup(o => o.context).returns({
            manufacturer: 'HUSQVARNA',
            model: 'AUTOMOWER 430XH',
            serialNumber: '12345',
            mowerId: mowerId
        });

        controlService.setup(o => o.resumeSchedule(mowerId)).returns(Promise.resolve(undefined));

        let status: Error | HAPStatus | null | undefined = undefined;
        await target.unsafeOnSet(false, (e) => {
            status = e;
        });

        controlService.verify(o => o.resumeSchedule(mowerId), Times.Once());
        expect(status).toBe(HAPStatus.SUCCESS);
    });

    it('should handle errors while pausing the mower', async () => {
        const mowerId = '12345';

        platformAccessory.setup(o => o.context).returns({
            manufacturer: 'HUSQVARNA',
            model: 'AUTOMOWER 430XH',
            serialNumber: '12345',
            mowerId: mowerId
        });

        controlService.setup(o => o.pause(mowerId)).throws(new Error('hello'));
        log.setup(o => o.error(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);

        let status: Error | HAPStatus | null | undefined = undefined;
        await target.unsafeOnSet(true, (e) => {
            status = e;
        });

        controlService.verify(o => o.pause(mowerId), Times.Once());
        log.verify(o => o.error(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()), Times.Once());
        expect(status).toBe(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    });

    it('should handle errors while resuming the schedule', async () => {
        const mowerId = '12345';

        platformAccessory.setup(o => o.context).returns({
            manufacturer: 'HUSQVARNA',
            model: 'AUTOMOWER 430XH',
            serialNumber: '12345',
            mowerId: mowerId
        });

        controlService.setup(o => o.resumeSchedule(mowerId)).throws(new Error('hello'));
        log.setup(o => o.error(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);

        let status: Error | HAPStatus | null | undefined = undefined;
        await target.unsafeOnSet(false, (e) => {
            status = e;
        });

        controlService.verify(o => o.resumeSchedule(mowerId), Times.Once());
        log.verify(o => o.error(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()), Times.Once());
        expect(status).toBe(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    });

    it('should refresh the characteristic value based on the policy result', () => {
        const mowerState: MowerState = {
            activity: Activity.MOWING,            
            state: State.IN_OPERATION
        };

        const c = new Mock<Characteristic>();
        c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        
        const statusActive = new Mock<Characteristic>();

        policy.setup(o => o.check()).returns(true);
        policy.setup(o => o.setMowerState(mowerState)).returns(undefined);
    
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());
        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Pause')).returns(service.object());
        log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);

        target.init(NameMode.DEFAULT);
        target.setMowerState(mowerState);

        policy.verify(o => o.setMowerState(mowerState), Times.Once());
        c.verify(o => o.updateValue(true), Times.Once());
    });

    it('should park on resume when the mower was previously going home', async () => {
        const mowerState: MowerState = {
            activity: Activity.GOING_HOME,            
            state: State.IN_OPERATION
        };

        const mowerId = '12345';

        platformAccessory.setup(o => o.context).returns({
            manufacturer: 'HUSQVARNA',
            model: 'AUTOMOWER 430XH',
            serialNumber: '12345',
            mowerId: mowerId
        });

        const c = new Mock<Characteristic>();
        c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
    
        const statusActive = new Mock<Characteristic>();

        policy.setup(o => o.check()).returns(true);
        policy.setup(o => o.setMowerState(mowerState)).returns(undefined);
    
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Pause')).returns(service.object());
        controlService.setup(o => o.parkUntilFurtherNotice(mowerId)).returns(Promise.resolve(undefined));
        log.setup(o => o.info(It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);

        target.init(NameMode.DEFAULT);
        target.setMowerState(mowerState);

        let status: Error | HAPStatus | null | undefined = undefined;
        await target.unsafeOnSet(false, (e) => {
            status = e;
        });

        controlService.verify(o => o.parkUntilFurtherNotice(mowerId), Times.Once());
        expect(status).toBe(HAPStatus.SUCCESS);
    });

    it('should not update the last activity when paused', () => {
        const mowerState1: MowerState = {
            activity: Activity.GOING_HOME,            
            state: State.IN_OPERATION
        };

        const mowerState2: MowerState = {
            activity: Activity.GOING_HOME,
            state: State.PAUSED
        };

        policy.setup(o => o.check()).returns(true);
        policy.setup(o => o.setMowerState(mowerState1)).returns(undefined);
        policy.setup(o => o.setMowerState(mowerState2)).returns(undefined);

        const c = new Mock<Characteristic>();
        c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());

        const statusActive = new Mock<Characteristic>();

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Pause')).returns(service.object());
        log.setup(o => o.info(It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);

        target.init(NameMode.DEFAULT);
        target.setMowerState(mowerState1);
        target.setMowerState(mowerState2);

        const result = target.getLastActivity();

        expect(result).toEqual(Activity.GOING_HOME);
    });

    // TODO: Clean this up.
    // it('should not update the last activity when paused', () => {
    //     const mowerState1: MowerState = {
    //         activity: Activity.GOING_HOME,            
    //         state: State.IN_OPERATION,
    //         enabled: true
    //     };

    //     const mowerState2: MowerState = {
    //         activity: Activity.NOT_APPLICABLE,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.HOME,
    //         state: State.PAUSED
    //     };

    //     policy.setup(o => o.check()).returns(true);
    //     policy.setup(o => o.setMowerState(mowerState1)).returns(undefined);
    //     policy.setup(o => o.setMowerState(mowerState2)).returns(undefined);

    //     const c = new Mock<Characteristic>();
    //     c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
    //     c.setup(o => o.on(CharacteristicEventTypes.SET, 
    //         It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());

    //     const statusActive = new Mock<Characteristic>();

    //     const service = new Mock<Service>();
    //     service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
    //     service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
    //     service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());

    //     platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Pause')).returns(service.object());
    //     log.setup(o => o.info(It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);

    //     target.init(NameMode.DEFAULT);
    //     target.setMowerState(mowerState1);
    //     target.setMowerState(mowerState2);

    //     const result = target.getLastActivity();

    //     expect(result).toEqual(Activity.GOING_HOME);
    // });

    it('should update the last activity when going home', () => {
        const mowerState: MowerState = {
            activity: Activity.GOING_HOME,
            state: State.IN_OPERATION
        };

        policy.setup(o => o.check()).returns(true);
        policy.setup(o => o.setMowerState(mowerState)).returns(undefined);

        const c = new Mock<Characteristic>();
        c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
        c.setup(o => o.on(CharacteristicEventTypes.SET, 
            It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());

        const statusActive = new Mock<Characteristic>();
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
        service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());

        platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Pause')).returns(service.object());
        log.setup(o => o.info(It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);
        
        target.init(NameMode.DEFAULT);
        target.setMowerState(mowerState);

        const result = target.getLastActivity();

        expect(result).toEqual(Activity.GOING_HOME);
    });

    it('should throw an error when not initialized on set mower connection', () => {
        const connection: MowerConnection = {
            connected: false
        };

        expect(() => target.setMowerConnection(connection)).toThrowError();
    });
});