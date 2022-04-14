import { OAuthTokenManager } from '../../../authentication/oauthTokenManager';
import { AutomowerClient, Mower } from '../../../clients/automowerClient';
import { NotAuthorizedError } from '../../../clients/notAuthorizedError';
import { GetMowersService } from '../getMowersService';

export class GetMowersServiceImpl implements GetMowersService {
    constructor(private tokenManager: OAuthTokenManager, private client: AutomowerClient) { }

    async getMower(id: string): Promise<Mower | undefined> {
        try {
            const token = await this.tokenManager.getCurrentToken();

            return this.client.getMower(id, token);
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }

    async getMowers(): Promise<Mower[]> {
        try {
            const token = await this.tokenManager.getCurrentToken();

            return this.client.getMowers(token);    
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }
}