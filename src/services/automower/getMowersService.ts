import { AutomowerClient } from '../../clients/automowerClient';
import { NotAuthorizedError } from '../../errors/notAuthorizedError';
import { Mower } from '../../model';
import { AccessTokenManager } from './accessTokenManager';

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