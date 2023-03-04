import * as model from '../../../model';

import { Activity, AutomowerClient, Mower, State } from '../../../clients/automower/automowerClient';
import { PlatformLogger } from '../../../diagnostics/platformLogger';
import { NotAuthorizedError } from '../../../errors/notAuthorizedError';
import { AccessTokenManager } from '../accessTokenManager';
import { GetMowersService } from '../discoveryService';

/**
 * Describes the model information parsed from the model data.
 */
interface ModelInformation {
    manufacturer: string;
    model: string;
}

export class AutomowerGetMowersServiceImpl implements GetMowersService {
    public constructor(private tokenManager: AccessTokenManager, private client: AutomowerClient, private log: PlatformLogger) { }    

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
                    enabled: this.isMowerEnabled(mower)
                }
            }
        };
    }

    protected isMowerEnabled(mower: Mower): boolean {
        // TODO: Fix this.
        return true;
    }

    protected convertMowerActivity(mower: Mower): model.Activity {
        switch (mower.attributes.mower.activity) {
            case Activity.CHARGING:
                return model.Activity.CHARGING;
                
            case Activity.PARKED_IN_CS:
            case Activity.NOT_APPLICABLE:
                return model.Activity.PARKED;
            
            case Activity.GOING_HOME:
                return model.Activity.GOING_HOME;
            
            case Activity.LEAVING:
                return model.Activity.LEAVING_HOME;

            case Activity.STOPPED_IN_GARDEN:
            case Activity.MOWING:
                return model.Activity.MOWING;

            case Activity.UNKNOWN:
                return model.Activity.UNKNOWN;

            default:
                this.log.debug('VALUE_NOT_SUPPORTED', mower.attributes.mower.activity);
                return model.Activity.UNKNOWN;
        }
    }

    protected convertMowerState(mower: Mower): model.State {
        if (mower.attributes.mower.state === State.STOPPED && mower.attributes.mower.errorCode !== 0) {
            return model.State.TAMPERED;
        }
        
        switch (mower.attributes.mower.state) {
            case State.IN_OPERATION:
                return model.State.IN_OPERATION;

            case State.ERROR:
            case State.ERROR_AT_POWER_UP:
            case State.FATAL_ERROR:
            case State.RESTRICTED:
            case State.STOPPED:
                return model.State.FAULTED;

            case State.PAUSED:
                return model.State.PAUSED;

            case State.NOT_APPLICABLE:
            case State.OFF:
                return model.State.OFF;
            
            case State.WAIT_POWER_UP:
            case State.WAIT_UPDATING:
            case State.UNKNOWN:
                return model.State.UNKNOWN;

            default:
                this.log.debug('VALUE_NOT_SUPPORTED', mower.attributes.mower.state);
                return model.State.UNKNOWN;
        }
    }

    private parseModelInformation(value: string): ModelInformation {
        const firstIndex = value.indexOf(' ');

        return {
            manufacturer: value.substring(0, firstIndex),
            model: value.substring(firstIndex + 1)
        };
    }
}