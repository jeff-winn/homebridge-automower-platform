import { It, Mock } from 'moq.ts';
import { AutomowerPlatformConfig } from '../../../../src/automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../../../src/clients/authenticationClient';
import { BadConfigurationError } from '../../../../src/errors/badConfigurationError';
import { ErrorFactory } from '../../../../src/errors/errorFactory';
import { DeviceType } from '../../../../src/model';
import { ClientCredentialsAuthorizationStrategy } from '../../../../src/services/husqvarna/authorization/ClientCredentialsAuthorizationStrategy';
import { PLUGIN_ID } from '../../../../src/settings';

describe('ClientCredentialsAuthorizationStrategy', () => {
    let client: Mock<AuthenticationClient>;
    let config: AutomowerPlatformConfig;
    let errorFactory: Mock<ErrorFactory>;

    const appKey = '12345';
    const appSecret = 'secret';

    let target: ClientCredentialsAuthorizationStrategy;

    beforeEach(() => {
        client = new Mock<AuthenticationClient>();        

        config = new AutomowerPlatformConfig({
            platform: PLUGIN_ID,
            appKey: appKey,
            application_secret: appSecret
        });

        errorFactory = new Mock<ErrorFactory>();

        target = new ClientCredentialsAuthorizationStrategy(errorFactory.object());
    });

    it('should throw an error when the config app key is undefined', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        config.appKey = undefined;

        await expect(target.authorizeAsync(config, client.object())).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the config app key is empty', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        config.appKey = '';

        await expect(target.authorizeAsync(config, client.object())).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the config app secret is undefined', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        config.application_secret = undefined;

        await expect(target.authorizeAsync(config, client.object())).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the config app secret is empty', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        config.application_secret = '';

        await expect(target.authorizeAsync(config, client.object())).rejects.toThrowError(BadConfigurationError);
    });

    it('should exchange the client credentials for an oauth token', async () => {
        const token: OAuthToken = {
            access_token: 'access_token',
            expires_in: 100,
            provider: 'provider',
            refresh_token: 'refresh_token',
            scope: 'scope',
            token_type: 'token_type',
            user_id: 'user_id'
        };

        client.setup(o => o.exchangeClientCredentials(appKey, appSecret, DeviceType.AUTOMOWER)).returnsAsync(token);

        await expect(target.authorizeAsync(config, client.object())).resolves.toBe(token);
    });
});