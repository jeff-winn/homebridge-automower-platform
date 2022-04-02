import { OAuthTokenManagerImpl } from '../../../src/authentication/impl/oauthTokenManagerImpl';
import { AuthenticationClient, OAuthToken } from '../../../src/clients/authenticationClient';
import { Mock, It, Times } from 'moq.ts';
import { AutomowerPlatformConfig } from '../../../src/automowerPlatformConfig';

class OAuthTokenManagerImplSpy extends OAuthTokenManagerImpl {
    loggedIn: boolean = false;

    protected override async doLogin(): Promise<OAuthToken> {
        let token = await super.doLogin();

        this.loggedIn = true;
        return token;
    }
}

describe("oauth token manager", () => {
    let client: Mock<AuthenticationClient>;
    let config: AutomowerPlatformConfig;

    const username: string = "username";
    const password: string = "password";
    const appKey: string = "12345";

    let target: OAuthTokenManagerImplSpy;

    beforeEach(() => {
        client = new Mock<AuthenticationClient>();        
        config = {
            username: username,
            password: password,
            appKey: appKey
        } as AutomowerPlatformConfig;

        target = new OAuthTokenManagerImplSpy(client.object(), config);
    });

    it("should login the user when the token does not yet exist", async () => {
        const accessToken: string = "abcd1234";
        const expiresIn: number = 1234;
        const provider: string = "provider";
        const refreshToken: string = "refresh token";
        const scope: string = "scope";
        const tokenType: string = "Bearer";
        const userId: string = "user id";

        client.setup(x => x.login(It.Is(u => u === "username"), It.Is(p => p === "password"))).returns(
            Promise.resolve({
                access_token: accessToken,
                expires_in: expiresIn,
                provider: provider,
                refresh_token: refreshToken,
                scope: scope,
                token_type: tokenType,
                user_id: userId
            } as OAuthToken));

        let token = await target.getCurrentToken();

        expect(target.loggedIn).toBeTruthy();

        expect(token).toBeDefined();
        expect(token.access_token).toBe(accessToken);
        expect(token.expires_in).toBe(expiresIn);
        expect(token.provider).toBe(provider);
        expect(token.refresh_token).toBe(refreshToken);
        expect(token.scope).toBe(scope);
        expect(token.token_type).toBe(tokenType);
        expect(token.user_id).toBe(userId);
    });
});