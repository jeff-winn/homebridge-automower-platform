import { Logging } from 'homebridge';

import { AccessTokenManager } from '../authentication/accessTokenManager';
import { AutomowerClient } from '../../clients/automowerClient';
import { NotAuthorizedError } from '../../errors/notAuthorizedError';
import { Mower } from '../../model';

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
    public constructor(private tokenManager: AccessTokenManager, private client: AutomowerClient, private log: Logging) { }

    public async getMower(id: string): Promise<Mower | undefined> {
        try {
            const token = await this.tokenManager.getCurrentToken();

            const result = await this.client.getMower(id, token);
            this.log.debug(`Retrieved mower ${id} from endpoint.\r\n`, JSON.stringify(result));

            return result;
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

            const result = await this.client.getMowers(token);
            this.log.debug('Retrieved mowers from endpoint...\r\n', JSON.stringify(result));

            return result;
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }
}