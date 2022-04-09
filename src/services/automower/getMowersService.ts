import { Mower } from '../../clients/automowerClient';

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
    getMowers(): Promise<Mower[] | undefined>;
}