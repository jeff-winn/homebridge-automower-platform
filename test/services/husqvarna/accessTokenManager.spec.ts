import { It, Mock, Times } from 'moq.ts';

import { AutomowerPlatformConfig } from '../../../src/automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../../src/clients/authenticationClient';
import { PlatformLogger } from '../../../src/diagnostics/platformLogger';
import { OAuth2AuthorizationStrategy } from '../../../src/services/husqvarna/accessTokenManager';
import { AccessTokenManagerImplSpy } from './accessTokenManagerImplSpy';

describe('AccessTokenManagerImpl', () => {
    let client: Mock<AuthenticationClient>;
    let config: AutomowerPlatformConfig;
    let login: Mock<OAuth2AuthorizationStrategy>;
    let log: Mock<PlatformLogger>;    

    const username = 'username';
    const password = 'password';
    const appKey = '12345';

    let target: AccessTokenManagerImplSpy;

    beforeEach(() => {
        client = new Mock<AuthenticationClient>();        
        config = {
            username: username,
            password: password,
            appKey: appKey
        } as AutomowerPlatformConfig;

        login = new Mock<OAuth2AuthorizationStrategy>();

        log = new Mock<PlatformLogger>();
        log.setup(x => x.debug(It.IsAny<string>())).returns(undefined);
        log.setup(x => x.info(It.IsAny<string>())).returns(undefined);

        target = new AccessTokenManagerImplSpy(client.object(), config, login.object(), log.object());
    });

    it('should throw an error when the current token is undefined', () => {
        expect(() => target.unsafeGetRequiredCurrentToken()).toThrowError();
    });

    it('should return the current token when set', () => {
        const token: OAuthToken = {
            access_token: 'abcd1234',
            expires_in: 1,
            provider: 'bob',
            refresh_token: '123456',
            scope: 'all the things',
            token_type: 'yay',
            user_id: 'me'
        };

        target.unsafeSetCurrentToken(token);

        const result = target.unsafeGetRequiredCurrentToken();

        expect(token).toEqual(result);
    });

   
    it('should not be logged in when the token is reset', () => {
        target.unsafeSetCurrentToken({
            access_token: 'abcd1234',
            expires_in: 1,
            provider: 'bob',
            refresh_token: '123456',
            scope: 'all the things',
            token_type: 'yay',
            user_id: 'me'
        });

        expect(target.hasAlreadyLoggedIn()).toBeTruthy();

        target.unsafeResetToken();

        expect(target.hasAlreadyLoggedIn()).toBeFalsy();
    });

    it('should login when the token does not yet exist', async () => {
        const accessToken = 'abcd1234';
        const expiresIn = 1234;
        const provider = 'provider';
        const refreshToken = 'refresh token';
        const scope = 'scope';
        const tokenType = 'Bearer';
        const userId = 'user id';

        login.setup(o => o.authorizeAsync(client.object())).returns(
            Promise.resolve({
                access_token: accessToken,
                expires_in: expiresIn,
                provider: provider,
                refresh_token: refreshToken,
                scope: scope,
                token_type: tokenType,
                user_id: userId
            } as OAuthToken));
        
        const token = await target.getCurrentTokenAsync();

        expect(target.loggedIn).toBeTruthy();

        expect(token).toBeDefined();
        expect(token.value).toBe(accessToken);
        expect(token.provider).toBe(provider);
    });

    it('should get a completely new token when the token has been invalidated', async () => {
        const token1: OAuthToken = {
            access_token: 'access token 1',
            expires_in: 50000,
            provider: 'provider',
            refresh_token: '12345',
            scope: '',
            token_type: 'Bearer',
            user_id: 'user id'
        };

        const token2: OAuthToken = {
            access_token: 'access token 2',
            expires_in: 0,
            provider: 'provider',
            refresh_token: '678910',
            scope: '',
            token_type: 'Bearer',
            user_id: 'user id'
        };
                
        let attempt = 0;
        login.setup(o => o.authorizeAsync(client.object())).callback(() => {
            attempt++;

            if (attempt === 1) {
                return Promise.resolve(token1);
            } else {
                return Promise.resolve(token2);
            }
        });

        const originalToken = await target.getCurrentTokenAsync();

        expect(originalToken.value).toBe(token1.access_token);
        expect(originalToken.provider).toBe(token1.provider);

        target.flagAsInvalid();
        const refreshToken = await target.getCurrentTokenAsync();

        expect(refreshToken.value).toBe(token2.access_token);
        expect(refreshToken.provider).toBe(token2.provider);
    });

    it('should refresh the token when the token has expired with a refresh token', async () => {
        const token1: OAuthToken = {
            access_token: 'access token 1',
            expires_in: -100,
            provider: 'provider',
            refresh_token: '12345',
            scope: '',
            token_type: 'Bearer',
            user_id: 'user id'
        };

        const token2: OAuthToken = {
            access_token: 'access token 2',
            expires_in: 0,
            provider: 'provider',
            refresh_token: '678910',
            scope: '',
            token_type: 'Bearer',
            user_id: 'user id'
        };
        
        login.setup(o => o.authorizeAsync(client.object())).returns(Promise.resolve(token1));
        client.setup(x => x.refreshAsync(appKey, token1)).returns(Promise.resolve(token2));

        const originalToken = await target.getCurrentTokenAsync();

        expect(originalToken.value).toBe(token1.access_token);
        expect(originalToken.provider).toBe(token1.provider);

        const refreshToken = await target.getCurrentTokenAsync();

        expect(refreshToken.value).toBe(token2.access_token);
        expect(refreshToken.provider).toBe(token2.provider);
    });

    it('should login the user again when the token has expired without a refresh token', async () => {
        const token1: OAuthToken = {
            access_token: 'access token 1',
            expires_in: -100,
            provider: 'provider',
            refresh_token: undefined,
            scope: '',
            token_type: 'Bearer',
            user_id: 'user id'
        };

        const token2: OAuthToken = {
            access_token: 'access token 2',
            expires_in: 0,
            provider: 'provider',
            refresh_token: undefined,
            scope: '',
            token_type: 'Bearer',
            user_id: 'user id'
        };
       
        let called = false;
        login.setup(o => o.authorizeAsync(client.object())).callback(() => {
            if (called) {
                return Promise.resolve(token2);
            }

            called = true;
            return Promise.resolve(token1);
        });

        const originalToken = await target.getCurrentTokenAsync();

        expect(originalToken.value).toBe(token1.access_token);
        expect(originalToken.provider).toBe(token1.provider);

        const refreshToken = await target.getCurrentTokenAsync();

        expect(refreshToken.value).toBe(token2.access_token);
        expect(refreshToken.provider).toBe(token2.provider);
    });

    it('should do nothing if the user is not logged in', async () => {
        target.unsafeSetCurrentToken(undefined);

        await target.logoutAsync();        

        login.verify(x => x.deauthorizeAsync(It.IsAny<OAuthToken>(), client.object()), Times.Never());
    });

    it('should logout the user when the user has been logged in', async () => {
        const token: OAuthToken = {
            access_token: 'access token',
            expires_in: -100,
            provider: 'provider',
            refresh_token: '12345',
            scope: '',
            token_type: 'Bearer',
            user_id: 'user id'
        };
        
        login.setup(x => x.deauthorizeAsync(token, client.object())).returnsAsync(undefined);

        target.unsafeSetCurrentToken(token);
        await target.logoutAsync();

        const result = target.unsafeGetCurrentToken();

        login.verify(x => x.deauthorizeAsync(token, client.object()), Times.Once());
        expect(result).toBeUndefined();
    });
});