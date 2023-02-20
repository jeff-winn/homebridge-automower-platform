import { Mower } from '../../../clients/automower/automowerClient';
import { GardenaClient } from '../../../clients/gardena/gardenaClient';
import { PlatformLogger } from '../../../diagnostics/platformLogger';
import { NotAuthorizedError } from '../../../errors/notAuthorizedError';
import { AccessToken } from '../../../model';
import { AccessTokenManager } from '../accessTokenManager';
import { GetMowersService } from '../discoveryService';

export class GardenaGetMowersService implements GetMowersService {
    public constructor(private tokenManager: AccessTokenManager, private client: GardenaClient, private log: PlatformLogger) { }

    public getMower(id: string): Promise<Mower | undefined> {
        return Promise.resolve(undefined);
    }

    public async getMowers(): Promise<Mower[]> {
        this.notifyPreviewFeatureIsBeingUsed();
        
        try {
            const token = await this.tokenManager.getCurrentToken();

            const locations = await this.client.getLocations(token);
            if (locations.length === 0) {
                return [];
            }

            const result: Mower[] = [];

            locations.forEach(async (location) => {
                const mowers = await this.findMowersAtLocation(location.id, token);
                if (mowers !== undefined) {
                    result.push(...mowers);
                }
            });

            return result;
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }

    protected async findMowersAtLocation(locationId: string, token: AccessToken): Promise<Mower[]> {
        await this.client.getLocation(locationId, token);
        return Promise.resolve([]);
    }
    
    /**
     * Notifies the user that the preview feature is currently being used, to ensure they're aware.
     */
    protected notifyPreviewFeatureIsBeingUsed(): void {
        this.log.warn('GARDENA_PREVIEW_IN_USE');
    }
}