import * as model from '../../../model';

import { AutomowerClient, Mower, RestrictedReason } from '../../../clients/automower/automowerClient';
import { PlatformLogger } from '../../../diagnostics/platformLogger';
import { NotAuthorizedError } from '../../../errors/notAuthorizedError';
import { AccessTokenManager } from '../accessTokenManager';
import { GetMowersService } from '../discoveryService';
import { AutomowerActivityConverter } from './converters/automowerActivityConverter';
import { AutomowerEnabledConverter } from './converters/automowerEnabledConverter';
import { AutomowerStateConverter } from './converters/automowerStateConverter';

/**
 * Describes the model information parsed from the model data.
 */
interface ModelInformation {
    manufacturer: string;
    model: string;
}

export class AutomowerGetMowersService implements GetMowersService {
    public constructor(private tokenManager: AccessTokenManager, private enabledConverter: AutomowerEnabledConverter, 
        private activityConverter: AutomowerActivityConverter, private stateConverter: AutomowerStateConverter,
        private client: AutomowerClient, private log: PlatformLogger) { }    

    public async getMowers(): Promise<model.Mower[]> {
        try {
            const token = await this.tokenManager.getCurrentToken();
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
                mower: {
                    activity: this.convertMowerActivity(mower),
                    state: this.convertMowerState(mower),
                },
                schedule: {
                    runContinuously: this.isSetToRunContinuously(mower),
                    runInFuture: this.isSetToRunInFuture(mower),
                    runOnSchedule: this.isSetToRunOnASchedule(mower)
                },
                settings: {
                    cuttingHeight: mower.attributes.settings.cuttingHeight
                }
            }
        };
    }

    protected isSetToRunInFuture(mower: Mower): boolean {      
        return mower.attributes.planner.nextStartTimestamp > 0 && mower.attributes.planner.restrictedReason === RestrictedReason.WEEK_SCHEDULE;
    }

    protected isSetToRunOnASchedule(mower: Mower): boolean {
        let result = false;

        for (const task of mower.attributes.calendar.tasks) {
            if (task !== undefined && (task.sunday || task.monday || task.tuesday || task.wednesday || 
                task.thursday || task.friday || task.saturday)) {
                result = true;
            }
        }

        return result;
    }

    protected isSetToRunContinuously(mower: Mower): boolean {
        const task = mower.attributes.calendar.tasks[0];
        if (task === undefined) {
            return false;
        }
        
        return mower.attributes.planner.nextStartTimestamp === 0 && task.start === 0 && task.duration === 1440 && 
            task.sunday && task.monday && task.tuesday && task.wednesday && task.thursday && task.friday && task.saturday;
    }  

    protected isMowerEnabled(mower: Mower): boolean {
        return this.enabledConverter.convert(mower);
    }

    protected convertMowerActivity(mower: Mower): model.Activity {
        return this.activityConverter.convert(mower);
    }

    protected convertMowerState(mower: Mower): model.State {
        return this.stateConverter.convert(mower);
    }

    private parseModelInformation(value: string): ModelInformation {
        const firstIndex = value.indexOf(' ');

        return {
            manufacturer: value.substring(0, firstIndex),
            model: value.substring(firstIndex + 1)
        };
    }
}