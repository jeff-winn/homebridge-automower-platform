import { OAuthTokenManager } from '../../../../src/authentication/oauthTokenManager';
import { AutomowerClient } from '../../../../src/clients/automowerClient';
import { PauseMowerServiceImpl } from '../../../../src/services/automower/impl/pauseMowerServiceImpl';
import { Mock, It, Times } from 'moq.ts';
import { OAuthToken } from '../../../../src/clients/authenticationClient';
import { NotAuthorizedError } from '../../../../src/clients/notAuthorizedError';

describe('pause mower service', () => {
    let tokenManager: Mock<OAuthTokenManager>;
    let client: Mock<AutomowerClient>;

    let target: PauseMowerServiceImpl;

    beforeEach(() => {
        tokenManager = new Mock<OAuthTokenManager>();
        client = new Mock<AutomowerClient>();

        target = new PauseMowerServiceImpl(tokenManager.object(), client.object());
    });
    
    it('should flag the token as invalid on pauseMower', async () => {
        const token: OAuthToken = {
            access_token: 'access token',
            expires_in: 50000,
            provider: 'provider',
            refresh_token: '12345',
            scope: '',
            token_type: 'Bearer',
            user_id: 'user id'
        };

        const mowerId = 'abcd1234';
        
        tokenManager.setup(x => x.getCurrentToken()).returns(Promise.resolve(token));
        tokenManager.setup(x => x.flagAsInvalid()).returns(undefined);
        client.setup(x => x.doAction(mowerId, It.IsAny(), token)).throws(new NotAuthorizedError());

        let threw = false;
        try {
            await target.pauseMower(mowerId);
        } catch (e) {
            threw = true;
        }

        expect(threw).toBeTruthy();                
        tokenManager.verify(x => x.flagAsInvalid(), Times.Once());
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

        await target.pauseMower(id);

        client.verify(x => x.doAction(id, It.IsAny(), token), Times.Once());
    });
});