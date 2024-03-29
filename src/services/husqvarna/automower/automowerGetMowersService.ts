import * as model from '../../../model';

import { AutomowerClient, Mower } from '../../../clients/automower/automowerClient';
import { NotAuthorizedError } from '../../../errors/notAuthorizedError';
import { AccessTokenManager } from '../accessTokenManager';
import { GetMowersService } from '../discoveryService';
import { AutomowerMowerScheduleConverter } from './converters/automowerMowerScheduleConverter';
import { AutomowerMowerStateConverter } from './converters/automowerMowerStateConverter';

/**
 * Describes the model information parsed from the model data.
 */
interface ModelInformation {
    manufacturer: string;
    model: string;
}

export class AutomowerGetMowersService implements GetMowersService {
    public constructor(private tokenManager: AccessTokenManager, private mowerStateConverter: AutomowerMowerStateConverter, 
        private mowerScheduleConverter: AutomowerMowerScheduleConverter, private client: AutomowerClient) { }    

    public async getMowers(): Promise<model.Mower[]> {
        try {
            const token = await this.tokenManager.getCurrentTokenAsync();
            const mowers = await this.client.getMowers(token);

            const result: model.Mower[] = [];

            for (const mower of mowers) {
                const m = this.createMower(mower);
                result.push(m);
            }

            return result;
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }

    protected createMower(mower: Mower): model.Mower {
        const modelInformation = this.parseModelInformation(mower.attributes.system.model);
        
        return {
            id: mower.id,
            attributes: {
                location: undefined,
                battery: {
                    level: mower.attributes.battery.batteryPercent
                },
                connection: {
                    connected: mower.attributes.metadata.connected
                },
                metadata: {
                    manufacturer: modelInformation.manufacturer,
                    model: modelInformation.model,
                    name: mower.attributes.system.name,
                    serialNumber: mower.attributes.system.serialNumber.toString()
                },
                mower: this.mowerStateConverter.convertMower(mower),
                schedule: this.mowerScheduleConverter.convertMower(mower),
                settings: {
                    cuttingHeight: mower.attributes.settings.cuttingHeight
                }
            }
        };
    }

    private parseModelInformation(value: string): ModelInformation {
        const firstIndex = value.indexOf(' ');

        return {
            manufacturer: value.substring(0, firstIndex),
            model: value.substring(firstIndex + 1)
        };
    }
}