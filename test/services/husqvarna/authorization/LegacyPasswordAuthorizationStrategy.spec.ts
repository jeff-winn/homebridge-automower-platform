import { It, Mock } from 'moq.ts';

import { AutomowerPlatformConfig } from '../../../../src/automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../../../src/clients/authenticationClient';
import { PlatformLogger } from '../../../../src/diagnostics/platformLogger';
import { BadConfigurationError } from '../../../../src/errors/badConfigurationError';
import { ErrorFactory } from '../../../../src/errors/errorFactory';
import { DeviceType } from '../../../../src/model';
import { LegacyPasswordAuthorizationStrategy } from '../../../../src/services/husqvarna/authorization/LegacyPasswordAuthorizationStrategy';
import { PLUGIN_ID } from '../../../../src/settings';

describe('LegacyPasswordAuthorizationStrategy', () => {
    let client: Mock<AuthenticationClient>;
    let config: AutomowerPlatformConfig;
    let errorFactory: Mock<ErrorFactory>;
    let log: Mock<PlatformLogger>;

    const username = 'username';
    const password = 'password';
    const appKey = '12345';

    let target: LegacyPasswordAuthorizationStrategy;

    beforeEach(() => {
        client = new Mock<AuthenticationClient>();        
        config = new AutomowerPlatformConfig({
            platform: PLUGIN_ID,
            username: username,
            password: password,
            appKey: appKey
        });

        log = new Mock<PlatformLogger>();
        errorFactory = new Mock<ErrorFactory>();

        target = new LegacyPasswordAuthorizationStrategy(errorFactory.object(), log.object());
    });

    it('should throw an error when the config app key is undefined', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        config.appKey = undefined;

        await expect(target.authorize(config, client.object())).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the config app key is empty', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        config.appKey = '';

        await expect(target.authorize(config, client.object())).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the config username is undefined', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        config.username = undefined;

        await expect(target.authorize(config, client.object())).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the config username is empty', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        config.username = '';

        await expect(target.authorize(config, client.object())).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the config password is undefined', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        config.password = undefined;

        await expect(target.authorize(config, client.object())).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the config password is empty', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));
            
        config.password = '';

        await expect(target.authorize(config, client.object())).rejects.toThrowError(BadConfigurationError);
    });

    it('should exchange the password for an oauth token', async () => {
        const token: OAuthToken = {
            access_token: 'access_token',
            expires_in: 100,
            provider: 'provider',
            refresh_token: 'refresh_token',
            scope: 'scope',
            token_type: 'token_type',
            user_id: 'user_id'
        };

        config.appKey = appKey;
        config.username = username;
        config.password = password;
        
        client.setup(o => o.exchangePassword(appKey, username, password, DeviceType.AUTOMOWER)).returnsAsync(token);
        log.setup(o => o.warn(It.IsAny<string>(), It.IsAny())).returns(undefined);

        await expect(target.authorize(config, client.object())).resolves.toBe(token);
    });
});