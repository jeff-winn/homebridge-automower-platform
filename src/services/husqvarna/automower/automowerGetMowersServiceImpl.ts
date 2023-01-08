import { AutomowerClient, Mower } from '../../../clients/automower/automowerClient';
import { NotAuthorizedError } from '../../../errors/notAuthorizedError';
import { AccessTokenManager } from '../accessTokenManager';
import { GetMowersService } from '../discoveryService';

export class AutomowerGetMowersServiceImpl implements GetMowersService {
    public constructor(private tokenManager: AccessTokenManager, private client: AutomowerClient) { }

    public async getMower(id: string): Promise<Mower | undefined> {
        try {
            const token = await this.tokenManager.getCurrentToken();
            return await this.client.getMower(id, token);
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }

    public async getMowers(): Promise<Mower[]> {
        try {
            const token = await this.tokenManager.getCurrentToken();
            return await this.client.getMowers(token);
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }
}