import { OAuthTokenManager } from '../../../authentication/oauthTokenManager';
import { AutomowerClient } from '../../../clients/automowerClient';
import { NotAuthorizedError } from '../../../clients/notAuthorizedError';
import { PauseMowerService } from '../pauseMowerService';

export class PauseMowerServiceImpl implements PauseMowerService {
    constructor(private tokenManager: OAuthTokenManager, private client: AutomowerClient) { }

    async pauseMower(id: string): Promise<void> {
        try {
            const token = await this.tokenManager.getCurrentToken();

            await this.client.doAction(id, {
                type: 'Pause'
            }, token);
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw(e);
        }        
    }
}