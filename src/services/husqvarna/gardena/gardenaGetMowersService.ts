import { Mower } from '../../../clients/automower/automowerClient';
import { GardenaClient } from '../../../clients/gardena/gardenaClient';
import { NotAuthorizedError } from '../../../errors/notAuthorizedError';
import { AccessTokenManager } from '../accessTokenManager';
import { GetMowersService } from '../discoveryService';

export class GardenaGetMowersService implements GetMowersService {
    public constructor(private tokenManager: AccessTokenManager, private client: GardenaClient) { }

    public getMower(id: string): Promise<Mower | undefined> {
        return Promise.resolve(undefined);
    }

    public async getMowers(): Promise<Mower[]> {
        try {
            const token = await this.tokenManager.getCurrentToken();

            const locations = await this.client.getLocations(token);
            // if (locations.length === 0) { // TODO: This likely needs to be more robust.
            //     return [];
            // }

            const location = locations[0]; // TODO: This should not assume data being present.
            await this.client.getLocation(location.id, token);

            return [];
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }    
}