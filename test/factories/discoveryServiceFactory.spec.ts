import { Mock, Times } from 'moq.ts';

import { AutomowerAccessoryFactoryImpl } from '../../src/automowerAccessoryFactory';
import { AutomowerPlatformConfig } from '../../src/automowerPlatform';
import { DefaultLogger } from '../../src/diagnostics/loggers/defaultLogger';
import { DiscoveryServiceFactoryImpl } from '../../src/factories/discoveryServiceFactory';
import { DeviceType } from '../../src/model';
import { PlatformContainer } from '../../src/primitives/platformContainer';
import { AutomowerGetMowersService } from '../../src/services/husqvarna/automower/automowerGetMowersService';
import { DiscoveryServiceImpl } from '../../src/services/husqvarna/discoveryService';
import { GardenaGetMowersService } from '../../src/services/husqvarna/gardena/gardenaGetMowersService';

describe('DiscoveryServiceFactoryImpl', () => {
    let config: AutomowerPlatformConfig;
    let container: Mock<PlatformContainer>;

    let target: DiscoveryServiceFactoryImpl;

    beforeEach(() => {
        config = new AutomowerPlatformConfig({
            platform: 'Homebridge Automower Platform'
        });

        container = new Mock<PlatformContainer>();

        target = new DiscoveryServiceFactoryImpl(config);
    });

    it('should create an automower compatible service by default', () => {
        config.device_type = undefined;

        const getMowersService = new Mock<AutomowerGetMowersService>();
        const automowerAccessoryFactory = new Mock<AutomowerAccessoryFactoryImpl>();
        const logger = new Mock<DefaultLogger>();

        container.setup(o => o.resolve(AutomowerGetMowersService)).returns(getMowersService.object());
        container.setup(o => o.resolve(AutomowerAccessoryFactoryImpl)).returns(automowerAccessoryFactory.object());

        container.setup(o => o.getLoggerClass()).returns(DefaultLogger);
        container.setup(o => o.resolve(DefaultLogger)).returns(logger.object());

        const result = target.create(container.object());
        
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(DiscoveryServiceImpl);

        container.verify(o => o.resolve(AutomowerGetMowersService), Times.Once());
    });

    it('should create an automower compatible service for automower device type', () => {
        config.device_type = DeviceType.AUTOMOWER;

        const getMowersService = new Mock<AutomowerGetMowersService>();
        const automowerAccessoryFactory = new Mock<AutomowerAccessoryFactoryImpl>();
        const logger = new Mock<DefaultLogger>();

        container.setup(o => o.resolve(AutomowerGetMowersService)).returns(getMowersService.object());
        container.setup(o => o.resolve(AutomowerAccessoryFactoryImpl)).returns(automowerAccessoryFactory.object());
        container.setup(o => o.getLoggerClass()).returns(DefaultLogger);
        container.setup(o => o.resolve(DefaultLogger)).returns(logger.object());
        
        const result = target.create(container.object());
        
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(DiscoveryServiceImpl);

        container.verify(o => o.resolve(AutomowerGetMowersService), Times.Once());
    });

    it('should create an automower compatible service for gardena device type', () => {
        config.device_type = DeviceType.GARDENA;

        const getMowersService = new Mock<GardenaGetMowersService>();
        const automowerAccessoryFactory = new Mock<AutomowerAccessoryFactoryImpl>();
        const logger = new Mock<DefaultLogger>();

        container.setup(o => o.resolve(GardenaGetMowersService)).returns(getMowersService.object());
        container.setup(o => o.resolve(AutomowerAccessoryFactoryImpl)).returns(automowerAccessoryFactory.object());
        container.setup(o => o.getLoggerClass()).returns(DefaultLogger);
        container.setup(o => o.resolve(DefaultLogger)).returns(logger.object());
        
        const result = target.create(container.object());
        
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(DiscoveryServiceImpl);

        container.verify(o => o.resolve(GardenaGetMowersService), Times.Once());
    });
});