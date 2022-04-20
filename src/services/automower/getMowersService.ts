import { OAuthTokenManager } from '../../authentication/oauthTokenManager';
import { AutomowerClient } from '../../clients/automowerClient';
import { NotAuthorizedError } from '../../errors/notAuthorizedError';
import { Mower } from '../../clients/model';

/**
 * A service used to retrieve the mowers associated with a Husqvarna account.
 */
export interface GetMowersService {
    /**
     * Gets a mower by the id.
     * @param id The id of the mower.
     */
    getMower(id: string) : Promise<Mower | undefined>;

    /**
     * Gets the mowers.
     */
    getMowers(): Promise<Mower[]>;
}

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