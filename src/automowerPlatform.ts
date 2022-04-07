import * as homebridge from 'homebridge';
import { PlatformAccessory } from 'homebridge';
import { AutomowerPlatformConfig } from './automowerPlatformConfig';
import { PLUGIN_NAME, PLATFORM_NAME } from './constants';

let Accessory: typeof PlatformAccessory;

export class AutomowerPlatform implements homebridge.DynamicPlatformPlugin {
    private readonly hap: homebridge.HAP;
    private readonly accessories: homebridge.PlatformAccessory[] = [];
    private readonly config: AutomowerPlatformConfig;

    constructor(private log: homebridge.Logging, config: homebridge.PlatformConfig, private api: homebridge.API) {
        this.hap = api.hap;
        this.config = config as AutomowerPlatformConfig;

        api.on(homebridge.APIEvent.DID_FINISH_LAUNCHING, async () => {
            log.info('Example platform \'didFinishLaunching\'');
        });
    }

    /*
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory: homebridge.PlatformAccessory): void {
        this.log('Configuring accessory %s', accessory.displayName);

        accessory.on(homebridge.PlatformAccessoryEvent.IDENTIFY, () => {
            this.log('%s identified!', accessory.displayName);
        });

        accessory.getService(this.hap.Service.Lightbulb)!.getCharacteristic(this.hap.Characteristic.On)
            .on(homebridge.CharacteristicEventTypes.SET, 
                (value: homebridge.CharacteristicValue, callback: homebridge.CharacteristicSetCallback) => {
                    this.log.info('%s Light was set to: ' + value);
                    callback();
                });

        this.accessories.push(accessory);
    }

    // --------------------------- CUSTOM METHODS ---------------------------

    addAccessory(name: string) {
        this.log.info('Adding new accessory with name %s', name);

        // uuid must be generated from a unique but not changing data source, name should not be used in the most cases.
        const uuid = this.hap.uuid.generate(name);
        const accessory = new Accessory(name, uuid);

        accessory.addService(this.hap.Service.Lightbulb, 'Test Light');

        this.configureAccessory(accessory); // abusing the configureAccessory here

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }

    removeAccessories() {
        this.log.info('Removing all accessories');

        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, this.accessories);
        this.accessories.splice(0, this.accessories.length); // clear out the array
    }
}