import * as model from '../../../model';

import { Common, Device, DeviceLink, GardenaClient, GetLocationResponse, LocationLink, Mower, RfLinkState, ThingType } from '../../../clients/gardena/gardenaClient';
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

            const mower = services.filter(o => o.type === ThingType.MOWER).shift() as Mower | undefined;
            if (mower !== undefined) {
                // Mower detected!
                const common = services.filter(o => o.type === ThingType.COMMON).shift() as Common; // The common service is always required.

                const mowerInstance = this.createMower(mower, common, location.data);
                result.push(mowerInstance);
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
                    isCharging: false,
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
                    activity: model.Activity.UNKNOWN, // TODO: Fix this.
                    state: this.convertMowerState(mower)
                }                
            }
        };       
    }

    protected convertMowerState(mower: Mower): model.State {
        if (mower.attributes.lastErrorCode.value === 'OFF_DISABLED') {
            return model.State.OFF;
        }

        return model.State.UNKNOWN;
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