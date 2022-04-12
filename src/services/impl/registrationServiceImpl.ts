import { API, Logging, PlatformAccessory } from 'homebridge';
import { AutomowerContext } from '../../automowerAccessory';
import { AutomowerPlatform } from '../../automowerPlatform';
import { PLATFORM_NAME, PLUGIN_ID } from '../../constants';
import { GetMowersService } from '../automower/getMowersService';
import { RegistrationService } from '../registrationService';

interface ModelInformation {
    manufacturer: string;
    model: string;
}

export class RegistrationServiceImpl implements RegistrationService {
    constructor(private mowerService: GetMowersService, private api: API, private log: Logging) { }

    async registerMowers(platform: AutomowerPlatform): Promise<void> {
        this.log.info('Discovering available mowers...');

        const newAccessories: PlatformAccessory<AutomowerContext>[] = [];
        const mowers = await this.mowerService.getMowers();
        
        mowers?.forEach(mower => {
            const uuid = this.api.hap.uuid.generate(mower.id);
            if (!platform.isAccessoryAlreadyRegistered(uuid)) {
                const displayName = mower.attributes.system.name;
                const modelInformation = this.parseModelInformation(mower.attributes.system.model);
                
                const accessory = new this.api.platformAccessory<AutomowerContext>(displayName, uuid);
                accessory.context = {
                    mowerId: mower.id,
                    manufacturer: modelInformation.manufacturer,
                    model: modelInformation.model,
                    serialNumber: mower.attributes.system.serialNumber.toString()
                };
                
                platform.configureAccessory(accessory);
                newAccessories.push(accessory);
            }
        });

        if (newAccessories.length > 0) {
            this.api.registerPlatformAccessories(PLUGIN_ID, PLATFORM_NAME, newAccessories);
        }

        this.log.info('Completed mower discovery.');
    }

    private parseModelInformation(value: string): ModelInformation {
        const firstIndex = value.indexOf(' ');

        return {
            manufacturer: value.substring(0, firstIndex),
            model: value.substring(firstIndex + 1)
        };
    }
}