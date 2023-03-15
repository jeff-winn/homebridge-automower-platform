import { PlatformConfig } from 'homebridge';
import { Mock } from 'moq.ts';
import { AutomowerPlatformConfig } from '../../src/automowerPlatform';
import { ErrorFactory } from '../../src/errors/errorFactory';
import { EventStreamServiceFactoryImpl } from '../../src/factories/eventStreamServiceFactory';
import { DeviceType } from '../../src/model';
import { PlatformContainer } from '../../src/primitives/platformContainer';
import { AutomowerEventStreamService } from '../../src/services/husqvarna/automower/automowerEventStreamService';
import { GardenaEventStreamService } from '../../src/services/husqvarna/gardena/gardenaEventStreamService';

describe('EventStreamServiceFactoryImpl', () => {
    let platformConfig: Mock<PlatformConfig>;

    let config: AutomowerPlatformConfig;
    let errorFactory: Mock<ErrorFactory>;
    let container: Mock<PlatformContainer>;

    let target: EventStreamServiceFactoryImpl;

    beforeEach(() => {
        platformConfig = new Mock<PlatformConfig>();

        config = new AutomowerPlatformConfig(platformConfig.object());
        errorFactory = new Mock<ErrorFactory>();
        container = new Mock<PlatformContainer>();

        target = new EventStreamServiceFactoryImpl(config, errorFactory.object());
    });

    it('resolve the automower event stream service by default', () => {
        const expected = new Mock<AutomowerEventStreamService>();

        config.device_type = undefined;
        container.setup(o => o.resolve(AutomowerEventStreamService)).returns(expected.object());

        const result = target.create(container.object());

        expect(result).toBe(expected.object());
    });

    it('resolve the automower event stream service by automower service', () => {
        const expected = new Mock<AutomowerEventStreamService>();

        config.device_type = DeviceType.AUTOMOWER;
        container.setup(o => o.resolve(AutomowerEventStreamService)).returns(expected.object());

        const result = target.create(container.object());

        expect(result).toBe(expected.object());
    });

    it('resolve the gardena event stream service', () => {
        const expected = new Mock<GardenaEventStreamService>();

        config.device_type = DeviceType.GARDENA;
        container.setup(o => o.resolve(GardenaEventStreamService)).returns(expected.object());

        const result = target.create(container.object());

        expect(result).toBe(expected.object());
    });
});