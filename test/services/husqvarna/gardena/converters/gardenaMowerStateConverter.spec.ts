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

    it('should return parked and off when charging while disabled', () => {
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

        expect(result.activity).toBe(Activity.PARKED);
        expect(result.state).toBe(State.OFF);
    });

    it('should return parked and dormant when park selected and not charging', () => {
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
        expect(result.state).toBe(State.DORMANT);
    });
});