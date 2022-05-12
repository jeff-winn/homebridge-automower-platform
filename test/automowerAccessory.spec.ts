import { PlatformAccessory } from 'homebridge';
import { Mock, Times } from 'moq.ts';

import { AutomowerAccessory, AutomowerContext } from '../src/automowerAccessory';
import { AutomowerEventTypes, StatusEvent } from '../src/events';
import { Activity, Battery, Mode, Mower, MowerState, State } from '../src/model';
import { BatteryService } from '../src/services/batteryService';
import { AccessoryInformationService } from '../src/services/accessoryInformationService';

describe('AutomowerAccessory', () => {
    let accessory: Mock<PlatformAccessory<AutomowerContext>>;
    let batteryService: Mock<BatteryService>;
    let informationService: Mock<AccessoryInformationService>;

    let target: AutomowerAccessory;

    beforeEach(() => {
        accessory = new Mock<PlatformAccessory<AutomowerContext>>();
        batteryService = new Mock<BatteryService>();
        informationService = new Mock<AccessoryInformationService>();    
    
        target = new AutomowerAccessory(accessory.object(), batteryService.object(), informationService.object());
    });

    it('should return the underlying platform accessory', () => {
        const actual = target.getUnderlyingAccessory();

        expect(actual).toBe(accessory.object());
    });

    it('should initialize all services', () => {
        batteryService.setup(o => o.init()).returns(undefined);
        informationService.setup(o => o.init()).returns(undefined);

        target.init();
        
        batteryService.verify(o => o.init(), Times.Once());
        informationService.verify(o => o.init(), Times.Once());
    });

    it('should refresh the services', () => {
        const battery: Battery = {
            batteryPercent: 100
        };

        const state: MowerState = {
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.NOT_APPLICABLE
        };

        const mower: Mower = {
            id: '12345',
            type: 'abcd1234',
            attributes: {
                battery: battery,
                calendar: {
                    tasks: []
                },
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: state,
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: 'nope'
                    },
                    restrictedReason: ''
                },
                positions: [],
                system: {
                    model: 'model',
                    name: 'name',
                    serialNumber: 1234                    
                }
            }
        };

        batteryService.setup(o => o.setBatteryLevel(battery)).returns(undefined);
        batteryService.setup(o => o.setChargingState(state)).returns(undefined);

        target.refresh(mower);

        batteryService.verify(o => o.setBatteryLevel(battery), Times.Once());
        batteryService.verify(o => o.setChargingState(state), Times.Once());
    });
    
    it('returns the accessory uuid', () => {
        const id = '12345';
        
        accessory.setup(x => x.context.mowerId).returns(id);

        const result = target.getId();
        expect(result).toBe(id);
    });

    it('should refresh all services when status event is received', () => {
        const battery: Battery = {
            batteryPercent: 100
        };

        const state: MowerState = {
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.HOME,
            state: State.NOT_APPLICABLE
        };

        const event: StatusEvent = {
            id: '12345',
            type: AutomowerEventTypes.STATUS,
            attributes: {
                battery: battery,
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: state,
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: ''
                }
            }
        };

        batteryService.setup(o => o.setBatteryLevel(battery)).returns(undefined);
        batteryService.setup(o => o.setChargingState(state)).returns(undefined);

        target.onStatusEventReceived(event);

        batteryService.verify(o => o.setBatteryLevel(battery), Times.Once());
        batteryService.verify(o => o.setChargingState(state), Times.Once());
    });
});