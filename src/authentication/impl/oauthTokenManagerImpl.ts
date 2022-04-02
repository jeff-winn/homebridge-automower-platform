import { AutomowerPlatformConfig } from "../../automowerPlatformConfig";
import { AuthenticationClient, OAuthToken } from "../../clients/authenticationClient";
import { OAuthTokenManager } from "../oauthTokenManager";

export class OAuthTokenManagerImpl implements OAuthTokenManager {
    private currentToken?: OAuthToken;
    private invalidated: boolean = false;    

    constructor(private client: AuthenticationClient, private config: AutomowerPlatformConfig) { }

    async getCurrentToken(): Promise<OAuthToken> {
        if (this.currentToken === undefined || this.invalidated) {
            this.currentToken = await this.doLogin();
        }

        return this.currentToken!;
    }

    protected async doLogin(): Promise<OAuthToken> {
        return await this.client.login(this.config.username, this.config.password);
    }

    flagAsInvalid(): void {
        this.invalidated = true;
    }
};