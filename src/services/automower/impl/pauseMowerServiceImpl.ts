import { OAuthTokenManager } from "../../../authentication/oauthTokenManager";
import { AutomowerClient } from "../../../clients/automowerClient";
import { PauseMowerService } from "../pauseMowerService";

export class PauseMowerServiceImpl implements PauseMowerService {
    constructor(private tokenManager: OAuthTokenManager, private client: AutomowerClient) { }

    async pauseMowerById(id: string) {
        let token = await this.tokenManager.getCurrentToken();

        await this.client.doAction(id, {
            type: "Pause"
        }, token);
    }
}