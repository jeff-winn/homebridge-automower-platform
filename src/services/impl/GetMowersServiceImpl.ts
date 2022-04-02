import { OAuthTokenManager } from "../../authentication/oauthTokenManager";
import { AutomowerClient, Mower } from "../../clients/automowerClient";
import { GetMowersService } from "../getMowersService";

export class GetMowersServiceImpl implements GetMowersService {
    constructor(private tokenManager: OAuthTokenManager, private client: AutomowerClient) { }

    async getMowers(): Promise<Mower[] | undefined> {
        const token = await this.tokenManager.getCurrentToken();

        return await this.client.getMowers(token);
    }
}