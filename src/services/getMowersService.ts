import { Mower } from "../clients/automowerClient";

/**
 * A service used to retrieve the mowers associated with a Husqvarna account.
 */
export interface GetMowersService {
    /**
     * Gets the mowers.
     */
    getMowers(): Promise<Mower[] | undefined>;
}