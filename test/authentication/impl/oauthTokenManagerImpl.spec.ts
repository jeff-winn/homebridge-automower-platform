import { AuthenticationClient, OAuthToken } from '../../../src/clients/authenticationClient';
import { AutomowerPlatformConfig } from '../../../src/automowerPlatformConfig';
import { OAuthTokenManagerImplSpy } from './oauthTokenManagerImplSpy';
import { Mock, It } from 'moq.ts';

describe('oauth token manager', () => {
    let client: Mock<AuthenticationClient>;
    let config: AutomowerPlatformConfig;

    const username = 'username';
    const password = 'password';
    const appKey = '12345';

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

    it('should login when the token does not yet exist', async () => {
        const accessToken = 'abcd1234';
        const expiresIn = 1234;
        const provider = 'provider';
        const refreshToken = 'refresh token';
        const scope = 'scope';
        const tokenType = 'Bearer';
        const userId = 'user id';

        client.setup(x => x.login(It.Is(u => u === username), It.Is(p => p === password))).returns(
            Promise.resolve({
                access_token: accessToken,
                expires_in: expiresIn,
                provider: provider,
                refresh_token: refreshToken,
                scope: scope,
                token_type: tokenType,
                user_id: userId
            } as OAuthToken));

        const token = await target.getCurrentToken();

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

    it('should refresh the token when the token has been invalidated', async () => {
        const token1: OAuthToken = {
            access_token: 'access token',
            expires_in: 50000,
            provider: 'provider',
            refresh_token: '12345',
            scope: '',
            token_type: 'Bearer',
            user_id: 'user id'
        };

        const token2: OAuthToken = {
            access_token: 'access token',
            expires_in: 0,
            provider: 'provider',
            refresh_token: '678910',
            scope: '',
            token_type: 'Bearer',
            user_id: 'user id'
        };
        
        client.setup(x => x.login(It.Is(u => u === username), It.Is(p => p === password))).returns(Promise.resolve(token1));
        client.setup(x => x.refresh(token1)).returns(Promise.resolve(token2));

        const originalToken = await target.getCurrentToken();

        expect(originalToken).toMatchObject(token1);

        target.flagAsInvalid();
        const refreshToken = await target.getCurrentToken();

        expect(refreshToken).toMatchObject(token2);
    });

    it('should refresh the token when the token has expired', async () => {
        const token1: OAuthToken = {
            access_token: 'access token',
            expires_in: -100,
            provider: 'provider',
            refresh_token: '12345',
            scope: '',
            token_type: 'Bearer',
            user_id: 'user id'
        };

        const token2: OAuthToken = {
            access_token: 'access token',
            expires_in: 0,
            provider: 'provider',
            refresh_token: '678910',
            scope: '',
            token_type: 'Bearer',
            user_id: 'user id'
        };
        
        client.setup(x => x.login(It.Is(u => u === username), It.Is(p => p === password))).returns(Promise.resolve(token1));
        client.setup(x => x.refresh(token1)).returns(Promise.resolve(token2));

        const originalToken = await target.getCurrentToken();

        expect(originalToken).toMatchObject(token1);

        const refreshToken = await target.getCurrentToken();

        expect(refreshToken).toMatchObject(token2);
    });
});