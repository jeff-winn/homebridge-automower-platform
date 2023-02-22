import * as model from '../../../clients/automower/automowerClient';

import { Common, Device, DeviceRef, GardenaClient, GetLocationResponse, LocationRef, Mower, ThingType } from '../../../clients/gardena/gardenaClient';
import { PlatformLogger } from '../../../diagnostics/platformLogger';
import { NotAuthorizedError } from '../../../errors/notAuthorizedError';
import { AccessToken } from '../../../model';
import { AccessTokenManager } from '../accessTokenManager';
import { GetMowersService } from '../discoveryService';

export class GardenaGetMowersService implements GetMowersService {
    public constructor(private tokenManager: AccessTokenManager, private client: GardenaClient, private log: PlatformLogger) { }

    public getMower(id: string): Promise<model.Mower | undefined> {
        return Promise.resolve(undefined);
    }

    public async getMowers(): Promise<model.Mower[]> {
        this.notifyPreviewFeatureIsBeingUsed();
        
        try {
            const token = await this.tokenManager.getCurrentToken();

            const ref = await this.getLocationReference(token);
            if (ref !== undefined) {
                const location = await this.client.getLocation(ref.id, token);
                if (location !== undefined) {
                    return this.findMowersAtLocation(location);
                }
            }

            return result;
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }

    protected async getLocationReference(token: AccessToken): Promise<LocationRef | undefined> {
        const locations = await this.client.getLocations(token);
        if (locations === undefined || locations.data === undefined || locations.data.length === 0) {
            return undefined;
        }

        return locations.data[0];
    }

    protected findMowersAtLocation(location: GetLocationResponse): model.Mower[] {
        const result: model.Mower[] = [];
        const devices = this.findDevicesAtLocation(location);

        devices.forEach(device => {
            const services = this.findDeviceServicesAtLocation(device, location);

            const mower = services.filter(o => o.type === ThingType.MOWER).shift() as Mower | undefined;
            if (mower !== undefined) {
                // Mower detected!
                const common = services.filter(o => o.type === ThingType.COMMON).shift() as Common; // The common service is always required.

                const mowerInstance = this.createMower(mower, common);
                result.push(mowerInstance);
            }
        });

        return result;
    }

    protected findDevicesAtLocation(location: GetLocationResponse): Device[] {
        const result: Device[] = [];

        const refs = location.data.relationships.devices.data.filter(device => device.type === ThingType.DEVICE).flat();
        refs.forEach(ref => {
            const device = location.included.filter(o => o.id === ref.id && o.type === ThingType.DEVICE).shift() as Device | undefined;
            if (device !== undefined) {
                result.push(device);
            }
        });
        
        return result;
    }
    
    protected findDeviceServicesAtLocation(device: Device, location: GetLocationResponse): DeviceRef[] {
        const result: DeviceRef[] = [];

        device.relationships.services.data.forEach(ref => {
            const service = location.included.filter(o => o.id === ref.id && o.type === ref.type).shift();
            if (service !== undefined) {
                result.push(service);
            }
        });

        return result;
    }

    protected createMower(mower: Mower, common: Common): model.Mower {
        return {
            id: mower.id,
            type: 'mower', // To match the automower stuff
            attributes: {
                battery: {
                    batteryPercent: common.attributes.batteryLevel.value                                
                },
                system: {
                    model: common.attributes.modelType.value,
                    name: common.attributes.name.value,
                    serialNumber: 0 // common.attributes.serial.value
                },
                calendar: {
                    tasks: []
                },
                mower: {
                    mode: model.Mode.HOME,
                    activity: model.Activity.PARKED_IN_CS,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    state: model.State.NOT_APPLICABLE
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: { }
                },
                metadata: {
                    connected: common.attributes.rfLinkState.value === 'CONNECTED', // This will likely need to be corrected.
                    statusTimestamp: 1
                },
                positions: [],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: model.HeadlightMode.ALWAYS_OFF
                    }                                
                },
                statistics: {
                    numberOfChargingCycles: 0,
                    numberOfCollisions: 0,
                    totalChargingTime: 0,
                    totalCuttingTime: 0,
                    totalRunningTime: 0,
                    totalSearchingTime: 0
                }
            }
        };
    }
    
    /**
     * Notifies the user that the preview feature is currently being used, to ensure they're aware.
     */
    protected notifyPreviewFeatureIsBeingUsed(): void {
        this.log.warn('GARDENA_PREVIEW_IN_USE');
    }
}