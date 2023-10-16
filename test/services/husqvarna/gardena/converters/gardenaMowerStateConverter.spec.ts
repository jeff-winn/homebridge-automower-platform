import { Mock } from 'moq.ts';
import { ItemType, MowerActivity, MowerError, MowerServiceDataItem, ServiceState } from '../../../../../src/clients/gardena/gardenaClient';

import { PlatformLogger } from '../../../../../src/diagnostics/platformLogger';
import { Activity, State } from '../../../../../src/model';
import { GardenaMowerStateConverterImpl } from '../../../../../src/services/husqvarna/gardena/converters/gardenaMowerStateConverter';

describe('GardenaMowerStateConverterImpl', () => {
    let log: Mock<PlatformLogger>;
    let target: GardenaMowerStateConverterImpl;

    beforeEach(() => {
        log = new Mock<PlatformLogger>();

        target = new GardenaMowerStateConverterImpl(log.object());
    });

    it('should return unknown and faulted when upside down', () => {
        const mower: MowerServiceDataItem = {
            id: '7a1ef85b-4e21-4d4d-8b77-1876aa913fb5',
            type: ItemType.MOWER,
            attributes: {
                state: {
                    value: ServiceState.ERROR,
                    timestamp: '2023-07-17T17:52:25.000+00:00'
                },
                activity: {
                    value: MowerActivity.NONE,
                    timestamp: '2023-07-17T17:52:25.000+00:00'
                },
                lastErrorCode: {
                    value: MowerError.UPSIDE_DOWN,
                    timestamp: '2023-07-17T17:52:26.000+00:00'
                },
                operatingHours: {
                    value: 1140
                }
            }
        };

        const result = target.convert(mower);

        expect(result.activity).toBe(Activity.UNKNOWN);
        expect(result.state).toBe(State.FAULTED);
    });

    it('should return unknown and tampered when lifted', () => {
        const mower: MowerServiceDataItem = {
            id: '7a1ef85b-4e21-4d4d-8b77-1876aa913fb5',
            type: ItemType.MOWER,
            attributes: {
                state: {
                    value: ServiceState.ERROR,
                    timestamp: '2023-07-17T17:57:19.000+00:00'
                },
                activity: {
                    value: MowerActivity.NONE,
                    timestamp: '2023-07-17T17:57:19.000+00:00'
                },
                lastErrorCode: {
                    value: MowerError.LIFTED,
                    timestamp: '2023-07-17T17:57:19.000+00:00'
                },
                operatingHours: {
                    value: 1140
                }
            }
        };

        const result = target.convert(mower);

        expect(result.activity).toBe(Activity.UNKNOWN);
        expect(result.state).toBe(State.TAMPERED);
    });

    it('should return off and unknown when charging while disabled', () => {
        const mower: MowerServiceDataItem = {
            id: '12345',
            type: ItemType.MOWER,
            relationships: {
                device: {
                    data: {
                        id: '12345',
                        type: ItemType.DEVICE
                    }
                }
            },
            attributes: {
                state: {
                    value: ServiceState.WARNING,
                    timestamp: '2023-03-18T23:53:53.684+00:00'
                },
                activity: {
                    value: MowerActivity.OK_CHARGING,
                    timestamp: '2023-03-18T23:53:53.684+00:00'
                },
                lastErrorCode: {
                    value: MowerError.OFF_DISABLED,
                    timestamp: '2022-12-09T09:59:16.505+00:00'
                },
                operatingHours: {
                    value: 1053
                }
            }
        };

        const result = target.convert(mower);

        expect(result.activity).toBe(Activity.OFF);
        expect(result.state).toBe(State.UNKNOWN);
    });

    it('should return parked and idle when park selected and not charging', () => {
        const mower: MowerServiceDataItem = {
            id: '12345',
            type: ItemType.MOWER,
            relationships: {
                device: {
                    data: {
                        id: '12345',
                        type: ItemType.DEVICE
                    }
                }
            },
            attributes: {
                state: {
                    value: ServiceState.OK,
                    timestamp: '2023-03-18T23:53:53.684+00:00'
                },
                activity: {
                    value: MowerActivity.PARKED_PARK_SELECTED,
                    timestamp: '2023-03-18T23:53:53.684+00:00'
                },
                operatingHours: {
                    value: 1053
                }
            }
        };

        const result = target.convert(mower);

        expect(result.activity).toBe(Activity.PARKED);
        expect(result.state).toBe(State.IDLE);
    });
});