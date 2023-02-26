import * as model from '../../../model';

import { 
    Activity, Common, Device, DeviceLink, ErrorCode, GardenaClient, GetLocationResponse, LocationLink, 
    Mower, RfLinkState, State, ThingType 
} from '../../../clients/gardena/gardenaClient';
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

export class GardenaGetMowersService implements GetMowersService {
    public constructor(private tokenManager: AccessTokenManager, private client: GardenaClient, private log: PlatformLogger) { }
    
    public async getMowers(): Promise<model.Mower[]> {
        this.notifyPreviewFeatureIsBeingUsed();
        
        try {
            const token = await this.tokenManager.getCurrentToken();

            const refs = await this.getLocationsForAccount(token);
            for (const ref of refs) {
                const location = await this.client.getLocation(ref.id, token);
                if (location !== undefined) {
                    return this.findMowersAtLocation(location);
                }
            }

            return [];
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }

    protected async getLocationsForAccount(token: model.AccessToken): Promise<LocationLink[]> {
        const locations = await this.client.getLocations(token);
        if (locations === undefined || locations.data === undefined || locations.data.length === 0) {
            return [];
        }

        const result: LocationLink[] = [];

        for (const location of locations.data) {
            result.push(location);
        }

        return result;
    }

    protected findMowersAtLocation(location: GetLocationResponse): model.Mower[] {
        const result: model.Mower[] = [];
        const devices = this.findDevicesAtLocation(location);

        for (const device of devices) {
            const services = this.findDeviceServicesAtLocation(device, location);

            // Check if the device has the mower service available.
            const mower = services.filter(o => o.type === ThingType.MOWER).shift() as Mower | undefined;
            if (mower !== undefined) {
                this.log.debug('GARDENA_MOWER_DETECTED', mower.id);
                
                const common = services.filter(o => o.type === ThingType.COMMON).shift() as Common | undefined; // The common service is always required.
                if (common === undefined) {
                    this.log.warn('GARDENA_MISSING_REQUIRED_COMMON_SERVICE', mower.id);
                } else {
                    const mowerInstance = this.createMower(mower, common, location.data);
                    result.push(mowerInstance);    
                }
            }
        }

        return result;
    }

    protected findDevicesAtLocation(location: GetLocationResponse): Device[] {
        const result: Device[] = [];

        const refs = location.data.relationships.devices.data.filter(device => device.type === ThingType.DEVICE).flat();

        for (const ref of refs) {
            const device = location.included.filter(o => o.id === ref.id && o.type === ThingType.DEVICE).shift() as Device | undefined;
            if (device !== undefined) {
                result.push(device);
            }
        }
        
        return result;
    }
    
    protected findDeviceServicesAtLocation(device: Device, location: GetLocationResponse): DeviceLink[] {
        const result: DeviceLink[] = [];

        for (const ref of device.relationships.services.data) {
            const service = location.included.filter(o => o.id === ref.id && o.type === ref.type).shift();
            if (service !== undefined) {
                result.push(service);
            }
        }

        return result;
    }

    protected createMower(mower: Mower, common: Common, location: LocationLink): model.Mower {
        const modelInformation = this.parseModelInformation(common.attributes.modelType.value);

        return {
            id: mower.id,
            attributes: {
                location: {
                    id: location.id
                },
                battery: {
                    level: common.attributes.batteryLevel.value,                    
                },
                connection: {
                    connected: common.attributes.rfLinkState.value === RfLinkState.ONLINE
                },
                metadata: {
                    manufacturer: modelInformation.manufacturer,
                    model: modelInformation.model,
                    name: common.attributes.name.value,
                    serialNumber: common.attributes.serial.value
                },
                mower: {
                    activity: this.convertMowerActivity(mower),
                    state: this.convertMowerState(mower)
                }                
            }
        };
    }

    protected convertMowerActivity(mower: Mower): model.Activity {
        switch (mower.attributes.activity.value) {
            case Activity.OK_CHARGING:
                return model.Activity.CHARGING;

            case Activity.OK_CUTTING:
            case Activity.OK_CUTTING_TIMER_OVERRIDDEN:
            case Activity.PAUSED:
                return model.Activity.MOWING;

            case Activity.OK_LEAVING:
                return model.Activity.LEAVING_HOME;

            case Activity.OK_SEARCHING:
                return model.Activity.GOING_HOME;

            case Activity.PARKED_AUTOTIMER:
            case Activity.PARKED_PARK_SELECTED:
            case Activity.PARKED_TIMER:
                return model.Activity.PARKED;

            case Activity.NONE:
                return model.Activity.UNKNOWN;

            default:
                this.log.debug('VALUE_NOT_SUPPORTED', mower.attributes.activity.value);
                return model.Activity.UNKNOWN;
        }
    }

    protected convertMowerState(mower: Mower): model.State {
        if (mower.attributes.activity.value === Activity.PAUSED) {
            return model.State.PAUSED;
        }

        switch (mower.attributes.lastErrorCode.value) {
            case ErrorCode.OFF_DISABLED:
            case ErrorCode.OFF_HATCH_CLOSED:
            case ErrorCode.OFF_HATCH_OPEN:
                return model.State.OFF;
            
            case ErrorCode.ALARM_MOWER_LIFTED:
            case ErrorCode.LIFTED:
            case ErrorCode.TEMPORARILY_LIFTED:
                return model.State.TAMPERED;

            case ErrorCode.TRAPPED:
            case ErrorCode.UPSIDE_DOWN:
                return model.State.FAULTED;

            default:                
                switch (mower.attributes.state.value) {
                    case State.OK:
                        return model.State.IN_OPERATION;
        
                    case State.WARNING:
                    case State.ERROR:
                        return model.State.FAULTED;
        
                    case State.UNAVAILABLE:
                        return model.State.UNKNOWN;

                    default:
                        return model.State.UNKNOWN;
                }
        }
    }
    
    private parseModelInformation(value: string): ModelInformation {
        const firstIndex = value.indexOf(' ');

        return {
            manufacturer: value.substring(0, firstIndex),
            model: value.substring(firstIndex + 1)
        };
    }

    /**
     * Notifies the user that the preview feature is currently being used, to ensure they're aware.
     */
    protected notifyPreviewFeatureIsBeingUsed(): void {
        this.log.warn('GARDENA_PREVIEW_IN_USE');
    }
}