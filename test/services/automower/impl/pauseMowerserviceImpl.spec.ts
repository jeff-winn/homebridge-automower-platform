import { OAuthTokenManager } from '../../../../src/authentication/oauthTokenManager';
import { AutomowerClient } from '../../../../src/clients/automowerClient';
import { PauseMowerServiceImpl } from '../../../../src/services/automower/impl/pauseMowerServiceImpl';
import { Mock, It, Times } from 'moq.ts';
import { OAuthToken } from '../../../../src/clients/authenticationClient';

describe('pause mower service', () => {
    let tokenManager: Mock<OAuthTokenManager>;
    let client: Mock<AutomowerClient>;

    let target: PauseMowerServiceImpl;

    beforeEach(() => {
        tokenManager = new Mock<OAuthTokenManager>();
        client = new Mock<AutomowerClient>();

        target = new PauseMowerServiceImpl(tokenManager.object(), client.object());
    });

    it('should pause the mower', async () => {
        const id = '12345';
        const token: OAuthToken = {
            access_token: '12345',
            expires_in: 1000,
            provider: 'husqvarna',
            refresh_token: 'abcd12345',
            scope: 'abcd',
            token_type: 'Bearer',
            user_id: 'me'
        };

        tokenManager.setup(x => x.getCurrentToken()).returns(Promise.resolve(token));
        client.setup(x => x.doAction(id, {
            type: 'Pause'
        }, token)).returns(Promise.resolve(undefined));

        await target.pauseMowerById(id);

        client.verify(x => x.doAction(id, It.IsAny(), token), Times.Once());
    });
});