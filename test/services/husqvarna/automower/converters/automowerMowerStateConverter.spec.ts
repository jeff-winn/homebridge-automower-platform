import { It, Mock, Times } from 'moq.ts';

import * as model from '../../../../../src/model';

import { Activity, HeadlightMode, Mode, Mower, RestrictedReason, State } from '../../../../../src/clients/automower/automowerClient';
import { PlatformLogger } from '../../../../../src/diagnostics/platformLogger';
import { AutomowerMowerStateConverterImpl } from '../../../../../src/services/husqvarna/automower/converters/automowerMowerStateConverter';

describe('AutomowerMowerStateConverterImpl', () => {
    let log: Mock<PlatformLogger>;
    let target: AutomowerMowerStateConverterImpl;

    beforeEach(() => {
        log = new Mock<PlatformLogger>();

        target = new AutomowerMowerStateConverterImpl(log.object());
    });

    it('should return parked when charging', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.CHARGING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.HOME,
                    state: State.UNKNOWN
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.activity).toEqual(model.Activity.PARKED);
        expect(result.state).toEqual(model.State.CHARGING);
    });

    it('should return idle when parked while restricted in charge station', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.PARKED_IN_CS,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.HOME,
                    state: State.RESTRICTED
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.NOT_APPLICABLE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.activity).toEqual(model.Activity.PARKED);
        expect(result.state).toEqual(model.State.IDLE);
    });

    it('should return parked when parked in charge station', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.PARKED_IN_CS,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.HOME,
                    state: State.UNKNOWN
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.activity).toEqual(model.Activity.PARKED);
        expect(result.state).toEqual(model.State.IDLE);
    });

    it('should return parked when not applicable', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.NOT_APPLICABLE,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.HOME,
                    state: State.UNKNOWN
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.activity).toEqual(model.Activity.PARKED);
    });

    it('should return going home when going home', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.GOING_HOME,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.UNKNOWN
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.activity).toEqual(model.Activity.MOWING);
        expect(result.state).toEqual(model.State.GOING_HOME);
    });
    
    it('should return leaving when leaving', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.LEAVING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.UNKNOWN
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.activity).toEqual(model.Activity.MOWING);
        expect(result.state).toEqual(model.State.LEAVING_HOME);
    });

    it('should return mowing when stopped in garden', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.STOPPED_IN_GARDEN,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.UNKNOWN
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.activity).toEqual(model.Activity.MOWING);
        expect(result.state).toEqual(model.State.UNKNOWN);
    });

    it('should return mowing when mowing', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.MOWING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.UNKNOWN
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.activity).toEqual(model.Activity.MOWING);
    });

    it('should return unknown when unknown', () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.UNKNOWN,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.UNKNOWN,
                    state: State.UNKNOWN
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.activity).toEqual(model.Activity.UNKNOWN);

        log.verify(o => o.debug(It.IsAny(), It.IsAny()), Times.Once());
    });   

    it('should return tampered when stopped with error', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.UNKNOWN,
                    errorCode: 1,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.STOPPED
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.state).toEqual(model.State.TAMPERED);
    });

    it('should return charging while mowing secondary area', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.CHARGING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.SECONDARY_AREA,
                    state: State.UNKNOWN
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.activity).toEqual(model.Activity.MOWING);
        expect(result.state).toEqual(model.State.CHARGING);
    });

    it('should return charging while mowing main area', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.CHARGING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.UNKNOWN
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.activity).toEqual(model.Activity.MOWING);
        expect(result.state).toEqual(model.State.CHARGING);
    });

    it('should return in operation when in operation', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.UNKNOWN,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.state).toEqual(model.State.IN_OPERATION);
    });

    it('should return faulted when error', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.UNKNOWN,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.ERROR
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.state).toEqual(model.State.FAULTED);
    });

    it('should return faulted when error at power up', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.UNKNOWN,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.ERROR_AT_POWER_UP
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.state).toEqual(model.State.FAULTED);
    });

    it('should return faulted when fatal error', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.UNKNOWN,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.FATAL_ERROR
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.state).toEqual(model.State.FAULTED);
    });

    it('should return faulted when restricted', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.UNKNOWN,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.RESTRICTED
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.state).toEqual(model.State.FAULTED);
    });

    it('should return faulted when stopped', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.UNKNOWN,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.STOPPED
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.state).toEqual(model.State.FAULTED);
    });

    it('should return paused when paused', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.UNKNOWN,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.PAUSED
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.state).toEqual(model.State.PAUSED);
    });

    it('should return unknown when not applicable', () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.UNKNOWN,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.UNKNOWN,
                    state: State.NOT_APPLICABLE
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.activity).toEqual(model.Activity.UNKNOWN);
        expect(result.state).toEqual(model.State.UNKNOWN);

        log.verify(o => o.debug(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should return off when off', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.UNKNOWN,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.OFF
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.activity).toEqual(model.Activity.OFF);
        expect(result.state).toEqual(model.State.UNKNOWN);
    });

    it('should return unknown when waiting for power up', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.UNKNOWN,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.WAIT_POWER_UP
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.state).toEqual(model.State.UNKNOWN);
    });

    it('should return unknown when waiting updating', () => {
        const mower: Mower = {
            id: '12345',
            type: 'mower',
            attributes: {
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: {
                    activity: Activity.UNKNOWN,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.WAIT_UPDATING
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.PARK_OVERRIDE
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 1,
                    numberOfCollisions: 1,
                    totalChargingTime: 1,
                    totalCuttingTime: 1,
                    totalRunningTime: 1,
                    totalSearchingTime: 1
                },
                system: {
                    model: 'Hello World',
                    name: 'Groovy',
                    serialNumber: 1
                },
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ 
                        {
                            start: 1,
                            duration: 1,
                            sunday: true,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result).toBeDefined();
        expect(result.state).toEqual(model.State.UNKNOWN);
    });
});