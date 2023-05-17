
import { Activity, HeadlightMode, Mode, Mower, RestrictedReason, State } from '../../../../../src/clients/automower/automowerClient';
import { AutomowerMowerScheduleConverterImpl } from '../../../../../src/services/husqvarna/automower/converters/automowerMowerScheduleConverter';

describe('AutomowerScheduleConverterImpl', () => {
    let target: AutomowerMowerScheduleConverterImpl;

    beforeEach(() => {
        target = new AutomowerMowerScheduleConverterImpl();
    });

    it('should return true when set to run continuously', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { }
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
                            start: 0,
                            duration: 1440, // 24 hours
                            sunday: true,
                            monday: true,
                            tuesday: true,
                            wednesday: true,
                            thursday: true,
                            friday: true,
                            saturday: true
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result.runContinuously).toBeTruthy();
    });
    
    it('should return false when not set to run continuously', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { }
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
                            start: 0,
                            duration: 1440, // 24 hours
                            sunday: true,
                            monday: true,
                            tuesday: false,
                            wednesday: true,
                            thursday: true,
                            friday: true,
                            saturday: true
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result.runContinuously).toBeFalsy();
    });

    it('should return false indicating not set to run continuously when no tasks', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { }
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
                    tasks: [ ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result.runContinuously).toBeFalsy();
    });

    it('should return true indicating set to run in future', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 1653984000000,
                    override: { },
                    restrictedReason: RestrictedReason.WEEK_SCHEDULE
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
                    tasks: [ ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result.runInFuture).toBeTruthy();
    });

    it('should return false indicating not set to run in future', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.WEEK_SCHEDULE
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
                    tasks: [ ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result.runInFuture).toBeFalsy();
    });

    it('should return false indicating not set to run in future when park is overridden', () => {
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

        expect(result.runInFuture).toBeFalsy();
    });

    it('should return true indicating set to run on schedule with task for sunday', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.WEEK_SCHEDULE
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

        expect(result.runOnSchedule).toBeTruthy();
    });

    it('should return true indicating set to run on schedule with task for monday', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.WEEK_SCHEDULE
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
                            sunday: false,
                            monday: true,
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

        expect(result.runOnSchedule).toBeTruthy();
    });

    it('should return true indicating set to run on schedule with task for tuesday', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.WEEK_SCHEDULE
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
                            sunday: false,
                            monday: false,
                            tuesday: true,
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

        expect(result.runOnSchedule).toBeTruthy();
    });

    it('should return true indicating set to run on schedule with task for wednesday', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.WEEK_SCHEDULE
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
                            sunday: false,
                            monday: false,
                            tuesday: false,
                            wednesday: true,
                            thursday: false,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result.runOnSchedule).toBeTruthy();
    });

    it('should return true indicating set to run on schedule with task for thursday', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.WEEK_SCHEDULE
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
                            sunday: false,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: true,
                            friday: false,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result.runOnSchedule).toBeTruthy();
    });

    it('should return true indicating set to run on schedule with task for friday', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.WEEK_SCHEDULE
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
                            sunday: false,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: true,
                            saturday: false
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result.runOnSchedule).toBeTruthy();
    });

    it('should return true indicating set to run on schedule with task for saturday', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.WEEK_SCHEDULE
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
                            sunday: false,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: true
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result.runOnSchedule).toBeTruthy();
    });

    it('should return true indicating set to run on schedule when a task is scheduled to start', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.WEEK_SCHEDULE
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
                            sunday: false,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        },
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

        expect(result.runOnSchedule).toBeTruthy();
    });

    it('should return false indicating not set to run on schedule when run continuously task is provided', () => {
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
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { },
                    restrictedReason: RestrictedReason.WEEK_SCHEDULE
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
                            start: 0,
                            duration: 1440,
                            sunday: true,
                            monday: true,
                            tuesday: true,
                            wednesday: true,
                            thursday: true,
                            friday: true,
                            saturday: true
                        }
                    ]
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result.runOnSchedule).toBeFalsy();
    });   

    it('should return false to run in future when parked', () => {
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

        expect(result.runInFuture).toBeFalsy();
    });

    it('should return false indicating set to not run continuously when no tasks are available', () => {
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
                    tasks: []
                }
            }
        };

        const result = target.convertMower(mower);

        expect(result.runContinuously).toBeFalsy();
    });
});