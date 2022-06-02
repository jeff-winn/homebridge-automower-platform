import { Mock } from 'moq.ts'; 

import { AuthenticationClientImpl, OAuthToken } from '../../src/clients/authenticationClient';
import { AutomowerEventStreamClientImpl } from '../../src/clients/automowerEventStreamClient';
import { FetchClient, RetryerFetchClient } from '../../src/clients/fetchClient';
import { PlatformLogger } from '../../src/diagnostics/platformLogger';
import * as constants from '../../src/settings';

describe('AutomowerEventStreamClientImpl', () => {
    // These values should come from your Husqvarna account, and be placed in the .env file at the root of the workspace.
    const APPKEY: string = process.env.HUSQVARNA_APPKEY || '';
    const USERNAME: string = process.env.HUSQVARNA_USERNAME || '';
    const PASSWORD: string = process.env.HUSQVARNA_PASSWORD || '';

    let target: AutomowerEventStreamClientImpl;
    let authClient: AuthenticationClientImpl;
    let fetch: FetchClient;

    let log: Mock<PlatformLogger>;
    let token: OAuthToken;

    beforeAll(async () => {
        log = new Mock<PlatformLogger>();
        fetch = new RetryerFetchClient(log.object(), 3, 1000);

        target = new AutomowerEventStreamClientImpl(constants.AUTOMOWER_STREAM_API_BASE_URL, log.object());
        authClient = new AuthenticationClientImpl(APPKEY, constants.AUTHENTICATION_API_BASE_URL, fetch);

        if (USERNAME !== '' && PASSWORD !== '') {
            token = await authClient.login(USERNAME, PASSWORD);
        }
    });

    afterAll(async () => {
        if (token !== undefined) {
            await authClient.logout(token);
        }
    });

    it.skip('should open and close the stream', () => {
        target.open({
            value: token.access_token,
            provider: token.provider
        });

        target.close();
    });
});
