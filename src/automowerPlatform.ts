import { PlatformAccessory, API, DynamicPlatformPlugin, PlatformConfig, APIEvent, Logging } from 'homebridge';
import { AutomowerPlatformConfig } from './automowerPlatformConfig';
import { AutomowerPlatformContainer } from './automowerPlatformContainer';
import { GetMowersService } from './services/automower/getMowersService';
import { GetMowersServiceImpl } from './services/automower/impl/getMowersServiceImpl';

export class AutomowerPlatform implements DynamicPlatformPlugin {
    private readonly accessories: PlatformAccessory[] = [];

    private readonly config: AutomowerPlatformConfig;
    private readonly container: AutomowerPlatformContainer;        

    constructor(private log: Logging, config: PlatformConfig, private api: API) {
        this.config = config as AutomowerPlatformConfig;
        this.container = new AutomowerPlatformContainer(this.config, this.log);

        api.on(APIEvent.DID_FINISH_LAUNCHING, () => {            
            this.onFinishedLaunching();
        });

        api.on(APIEvent.SHUTDOWN, () => {
            this.onShutdown();
        });
    }

    private async onFinishedLaunching(): Promise<void> {
        this.container.registerEverything();        

        await this.discoverMowers();

        this.log.debug('onFinishLaunching');
    }
    
    private async discoverMowers(): Promise<void> {
        this.log.info('Discovering available mowers...');

        const mowerService = this.getMowerService();
        const mowers = await mowerService.getMowers();
        
        mowers?.forEach(mower => {
            this.log.info(`Found mower: ${mower.attributes.system.name}`);
        });

        this.log.info('Completed mower discovery.');
    }

    protected getMowerService(): GetMowersService {
        return this.container.resolve(GetMowersServiceImpl);
    }

    private onShutdown(): void {
        this.log.debug('onShutdown');
    }

    /*
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory: PlatformAccessory): void {
        this.log.info(`Configuring accessory ${accessory.displayName}`);
    }    
}