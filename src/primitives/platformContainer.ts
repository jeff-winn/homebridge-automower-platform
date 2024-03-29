import 'reflect-metadata';

import { API, Logging } from 'homebridge';
import { container, InjectionToken } from 'tsyringe';

import * as settings from '../settings';

import { AutomowerPlatformConfig } from '../automowerPlatform';
import { AuthenticationClientImpl } from '../clients/authenticationClient';
import { AutomowerClientImpl } from '../clients/automower/automowerClient';
import { AutomowerEventStreamClientImpl } from '../clients/automower/automowerEventStreamClient';
import { RateLimitedAutomowerClient } from '../clients/automower/rateLimitedAutomowerClient';
import { RetryerFetchClient } from '../clients/fetchClient';
import { GardenaClient, GardenaClientImpl } from '../clients/gardena/gardenaClient';
import { SampleGardenaClientImpl } from '../clients/gardena/sampleGardenaClient';
import { DefaultLogger } from '../diagnostics/loggers/defaultLogger';
import { ForceDebugLogger } from '../diagnostics/loggers/forceDebugLogger';
import { HomebridgeImitationLogger } from '../diagnostics/loggers/homebridgeImitationLogger';
import { LoggerType, PlatformLogger } from '../diagnostics/platformLogger';
import { ConsoleWrapperImpl } from '../diagnostics/primitives/consoleWrapper';
import { DefaultErrorFactory } from '../errors/errorFactory';
import { DiscoveryServiceFactoryImpl } from '../factories/discoveryServiceFactory';
import { EventStreamServiceFactoryImpl } from '../factories/eventStreamServiceFactory';
import { GardenaEventStreamServiceFactoryImpl } from '../factories/gardenaEventStreamServiceFactory';
import { AuthenticationMode } from '../model';
import { MowerAccessoryFactoryImpl } from '../mowerAccessoryFactory';
import { AccessTokenManagerImpl, OAuth2AuthorizationStrategy } from '../services/husqvarna/accessTokenManager';
import { ClientCredentialsAuthorizationStrategy } from '../services/husqvarna/authorization/ClientCredentialsAuthorizationStrategy';
import { LegacyPasswordAuthorizationStrategy } from '../services/husqvarna/authorization/LegacyPasswordAuthorizationStrategy';
import { AutomowerEventStreamService } from '../services/husqvarna/automower/automowerEventStreamService';
import { AutomowerGetMowersService } from '../services/husqvarna/automower/automowerGetMowersService';
import { AutomowerMowerControlService } from '../services/husqvarna/automower/automowerMowerControlService';
import { ChangeSettingsServiceImpl } from '../services/husqvarna/automower/changeSettingsService';
import { AutomowerMowerScheduleConverterImpl } from '../services/husqvarna/automower/converters/automowerMowerScheduleConverter';
import { AutomowerMowerStateConverterImpl } from '../services/husqvarna/automower/converters/automowerMowerStateConverter';
import { GardenaMowerStateConverterImpl } from '../services/husqvarna/gardena/converters/gardenaMowerStateConverter';
import { CompositeGardenaEventStreamService } from '../services/husqvarna/gardena/gardenaEventStreamService';
import { GardenaGetMowersService } from '../services/husqvarna/gardena/gardenaGetMowersService';
import { GardenaManualMowerControlService } from '../services/husqvarna/gardena/gardenaMowerControlService';
import { DeterministicMowerFaultedPolicy } from '../services/policies/mowerFaultedPolicy';
import { DeterministicMowerInMotionPolicy } from '../services/policies/mowerInMotionPolicy';
import { DeterministicMowerIsArrivingPolicy } from '../services/policies/mowerIsArrivingPolicy';
import { DeterministicMowerIsActivePolicy, DeterministicMowerIsScheduledPolicy } from '../services/policies/mowerIsEnabledPolicy';
import { DeterministicMowerIsPausedPolicy } from '../services/policies/mowerIsPausedPolicy';
import { DeterministicMowerTamperedPolicy } from '../services/policies/mowerTamperedPolicy';
import { isDevelopmentEnvironment, NodeJsEnvironment } from './environment';
import { Y18nLocalization } from './localization';
import { PlatformAccessoryFactoryImpl } from './platformAccessoryFactory';
import { TimerImpl } from './timer';

export interface PlatformContainer {
    registerEverything(): void;
    
    resolve<T>(token: InjectionToken<T>): T;

    getLoggerClass(): InjectionToken<PlatformLogger>;

    getGardenaClientClass(): InjectionToken<GardenaClient>;
}

export class PlatformContainerImpl implements PlatformContainer {
    public constructor(private config: AutomowerPlatformConfig, private api: API, private log: Logging) { }

    public registerEverything(): void {
        container.register(NodeJsEnvironment, {
            useValue: new NodeJsEnvironment()
        });

        container.register(ConsoleWrapperImpl, {
            useValue: new ConsoleWrapperImpl() 
        });

        container.register(Y18nLocalization, {
            useValue: new Y18nLocalization(
                this.config.lang, 
                container.resolve(NodeJsEnvironment))
        });

        container.register(DefaultLogger, {
            useFactory: (context) => new DefaultLogger(
                this.log,
                context.resolve(Y18nLocalization),
                context.resolve(NodeJsEnvironment))
        });

        container.register(ForceDebugLogger, {
            useFactory: (context) => new ForceDebugLogger(
                context.resolve(ConsoleWrapperImpl),
                this.log,
                context.resolve(Y18nLocalization),
                context.resolve(NodeJsEnvironment))
        });

        container.register(HomebridgeImitationLogger, {
            useFactory: (context) => new HomebridgeImitationLogger(
                context.resolve(NodeJsEnvironment),
                settings.PLATFORM_NAME, 
                this.config.name,
                context.resolve(ConsoleWrapperImpl),
                context.resolve(Y18nLocalization))
        });

        container.register(RetryerFetchClient, {
            useFactory: (context) => new RetryerFetchClient(
                context.resolve(this.getLoggerClass()))
        });

        container.register(TimerImpl, {
            useFactory: () => new TimerImpl()
        });

        container.register(DefaultErrorFactory, {
            useFactory: (context) => new DefaultErrorFactory(
                context.resolve(Y18nLocalization))
        });
        
        container.register(AuthenticationClientImpl, {
            useFactory: (context) => new AuthenticationClientImpl(
                settings.AUTHENTICATION_API_BASE_URL,
                context.resolve(RetryerFetchClient),
                context.resolve(DefaultErrorFactory))
        });

        container.register(LegacyPasswordAuthorizationStrategy, {
            useFactory: (context) => new LegacyPasswordAuthorizationStrategy(
                context.resolve(DefaultErrorFactory),
                context.resolve(this.getLoggerClass()),
                this.config)
        });

        container.register(ClientCredentialsAuthorizationStrategy, {
            useFactory: (context) => new ClientCredentialsAuthorizationStrategy(
                context.resolve(DefaultErrorFactory),
                this.config)
        });
        
        container.registerInstance(AccessTokenManagerImpl, new AccessTokenManagerImpl(
            container.resolve(AuthenticationClientImpl),
            this.config,
            container.resolve(this.getLoginStrategyClass()),
            container.resolve(this.getLoggerClass())));

        container.registerInstance(SampleGardenaClientImpl, new SampleGardenaClientImpl());
        container.registerInstance(GardenaClientImpl, new GardenaClientImpl(
            this.config.appKey,
            settings.GARDENA_SMART_SYSTEM_API_BASE_URL,
            container.resolve(RetryerFetchClient),
            container.resolve(DefaultErrorFactory)));

        container.registerInstance(AutomowerClientImpl, new RateLimitedAutomowerClient(
            this.config.appKey,
            settings.AUTOMOWER_CONNECT_API_BASE_URL,
            container.resolve(RetryerFetchClient),
            container.resolve(DefaultErrorFactory)));

        container.register(DeterministicMowerIsArrivingPolicy, {
            useValue: new DeterministicMowerIsArrivingPolicy()
        });

        container.register(DeterministicMowerIsPausedPolicy, {
            useValue: new DeterministicMowerIsPausedPolicy()
        });

        container.register(DeterministicMowerInMotionPolicy, {
            useValue: new DeterministicMowerInMotionPolicy()
        });

        container.register(DeterministicMowerFaultedPolicy, {
            useValue: new DeterministicMowerFaultedPolicy()
        });

        container.register(DeterministicMowerIsScheduledPolicy, {
            useValue: new DeterministicMowerIsScheduledPolicy()
        });

        container.register(DeterministicMowerIsActivePolicy, {
            useValue: new DeterministicMowerIsActivePolicy()
        });

        container.register(DeterministicMowerTamperedPolicy, {
            useValue: new DeterministicMowerTamperedPolicy()
        });

        container.registerInstance(GardenaMowerStateConverterImpl, new GardenaMowerStateConverterImpl(this.log));

        container.register(GardenaGetMowersService, {
            useFactory: (context) => new GardenaGetMowersService(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(GardenaMowerStateConverterImpl),
                context.resolve(this.getGardenaClientClass()),
                context.resolve(this.getLoggerClass()))
        });
        
        container.registerInstance(AutomowerMowerStateConverterImpl, new AutomowerMowerStateConverterImpl(this.log));
        container.registerInstance(AutomowerMowerScheduleConverterImpl, new AutomowerMowerScheduleConverterImpl());

        container.register(AutomowerGetMowersService, {
            useFactory: (context) => new AutomowerGetMowersService(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(AutomowerMowerStateConverterImpl),
                context.resolve(AutomowerMowerScheduleConverterImpl),
                context.resolve(AutomowerClientImpl))
        });

        container.register(ChangeSettingsServiceImpl, {
            useFactory: (context) => new ChangeSettingsServiceImpl(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(AutomowerClientImpl))
        });
        
        container.register(AutomowerMowerControlService, {
            useFactory: (context) => new AutomowerMowerControlService(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(AutomowerClientImpl)) 
        });

        container.register(PlatformAccessoryFactoryImpl, {
            useFactory: () => new PlatformAccessoryFactoryImpl(this.api)
        });

        container.register(MowerAccessoryFactoryImpl, {
            useFactory: (context) => new MowerAccessoryFactoryImpl(
                context.resolve(PlatformAccessoryFactoryImpl),
                this.api,
                context.resolve(this.getLoggerClass()),
                this,
                context.resolve(Y18nLocalization),
                this.config)
        });

        container.registerInstance(DiscoveryServiceFactoryImpl, 
            new DiscoveryServiceFactoryImpl(this.config));

        container.register(EventStreamServiceFactoryImpl, {
            useFactory: (context) => new EventStreamServiceFactoryImpl(
                this.config, context.resolve(DefaultErrorFactory))
        });

        container.register(AutomowerEventStreamClientImpl, {
            useFactory: (context) => new AutomowerEventStreamClientImpl(
                settings.AUTOMOWER_STREAM_API_BASE_URL, 
                context.resolve(this.getLoggerClass()))
        });

        container.register(AutomowerEventStreamService, {
            useFactory: (context) => new AutomowerEventStreamService(
                context.resolve(AutomowerMowerStateConverterImpl),
                context.resolve(AutomowerMowerScheduleConverterImpl),
                context.resolve(AccessTokenManagerImpl),
                context.resolve(AutomowerEventStreamClientImpl),
                context.resolve(this.getLoggerClass()),
                context.resolve(TimerImpl))                
        });

        container.register(GardenaEventStreamServiceFactoryImpl, {
            useFactory: (context) => new GardenaEventStreamServiceFactoryImpl(
                this, context.resolve(this.getLoggerClass()))
        });

        container.register(CompositeGardenaEventStreamService, {
            useFactory: (context) => new CompositeGardenaEventStreamService(
                context.resolve(this.getGardenaClientClass()),
                context.resolve(GardenaEventStreamServiceFactoryImpl),
                context.resolve(AccessTokenManagerImpl),
                context.resolve(this.getLoggerClass()))
        });

        container.register(GardenaManualMowerControlService, {
            useFactory: (context) => new GardenaManualMowerControlService(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(this.getGardenaClientClass()))
        });
    }

    public getGardenaClientClass(): InjectionToken<GardenaClient> {
        if (isDevelopmentEnvironment()) {
            return SampleGardenaClientImpl;
        }

        return GardenaClientImpl;
    }

    public getLoggerClass(): InjectionToken<PlatformLogger> {
        if (this.config.logger_type !== undefined) {
            if (this.config.logger_type === LoggerType.IMITATION) {
                return HomebridgeImitationLogger;
            } else if (this.config.logger_type === LoggerType.FORCE_DEBUG) {
                return ForceDebugLogger;
            }            
        }

        return DefaultLogger;
    }

    protected getLoginStrategyClass(): InjectionToken<OAuth2AuthorizationStrategy> {
        if (this.config.getAuthenticationModeOrDefault() === AuthenticationMode.CLIENT_CREDENTIALS) {
            return ClientCredentialsAuthorizationStrategy;
        }

        return LegacyPasswordAuthorizationStrategy;
    }

    public resolve<T>(token: InjectionToken<T>): T {
        return container.resolve(token);
    }
}