import { It, Mock, Times } from 'moq.ts';

import { AutomowerPlatformConfig } from '../../../src/automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../../src/clients/authenticationClient';
import { PlatformLogger } from '../../../src/diagnostics/platformLogger';
import { BadConfigurationError } from '../../../src/errors/badConfigurationError';
import { ErrorFactory } from '../../../src/errors/errorFactory';
import { AccessTokenManagerImplSpy } from './accessTokenManagerImplSpy';

describe('AccessTokenManagerImpl', () => {
    let client: Mock<AuthenticationClient>;
    let config: AutomowerPlatformConfig;
    let errorFactory: Mock<ErrorFactory>;
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

        errorFactory = new Mock<ErrorFactory>();

        log = new Mock<PlatformLogger>();
        log.setup(x => x.debug(It.IsAny<string>())).returns(undefined);
        log.setup(x => x.info(It.IsAny<string>())).returns(undefined);

        target = new AccessTokenManagerImplSpy(client.object(), config, log.object(), errorFactory.object());
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

    it('should throw an error when the config username is undefined', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        config.username = undefined;

        await expect(target.unsafeDoLogin()).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the config username is empty', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        config.username = '';

        await expect(target.unsafeDoLogin()).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the config password is undefined', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        config.password = undefined;

        await expect(target.unsafeDoLogin()).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the config password is empty', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));
            
        config.password = '';

        await expect(target.unsafeDoLogin()).rejects.toThrowError(BadConfigurationError);
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
        client.setup(o => o.login(username, password)).callback(() => {
            attempt++;

            if (attempt === 1) {
                return Promise.resolve(token1);
            } else {
                return Promise.resolve(token2);
            }            
        });

        const originalToken = await target.getCurrentToken();

        expect(originalToken.value).toBe(token1.access_token);
        expect(originalToken.provider).toBe(token1.provider);

        target.flagAsInvalid();
        const refreshToken = await target.getCurrentToken();

        expect(refreshToken.value).toBe(token2.access_token);
        expect(refreshToken.provider).toBe(token2.provider);
    });

    it('should refresh the token when the token has expired', async () => {
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
        
        client.setup(x => x.login(It.Is(u => u === username), It.Is(p => p === password))).returns(Promise.resolve(token1));
        client.setup(x => x.refresh(token1)).returns(Promise.resolve(token2));

        const originalToken = await target.getCurrentToken();

        expect(originalToken.value).toBe(token1.access_token);
        expect(originalToken.provider).toBe(token1.provider);

        const refreshToken = await target.getCurrentToken();

        expect(refreshToken.value).toBe(token2.access_token);
        expect(refreshToken.provider).toBe(token2.provider);
    });

    it('should do nothing if the user is not logged in', async () => {
        target.unsafeSetCurrentToken(undefined);

        await target.logout();        

        client.verify(x => x.logout(It.IsAny<OAuthToken>()), Times.Never());
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
        
        client.setup(x => x.logout(token)).returns(Promise.resolve(undefined));

        target.unsafeSetCurrentToken(token);
        await target.logout();

        const result = target.unsafeGetCurrentToken();

        client.verify(x => x.logout(token), Times.Once());
        expect(result).toBeUndefined();
    });
});