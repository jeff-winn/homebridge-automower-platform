import { AutomowerClient, ChangeSettingsRequest } from '../../../../src/clients/automowerClient';
import { AccessTokenManager } from '../../../../src/services/husqvarna/accessTokenManager';
import { Mock, It, Times } from 'moq.ts';
import { ChangeSettingsServiceImpl } from '../../../../src/services/husqvarna/automower/changeSettingsService';
import { AccessToken } from '../../../../src/model';
import { NotAuthorizedError } from '../../../../src/errors/notAuthorizedError';

describe('ChangeSettingsServiceImpl', () => {
    let tokenManager: Mock<AccessTokenManager>;
    let client: Mock<AutomowerClient>;

    let target: ChangeSettingsServiceImpl;

    beforeEach(() => {
        tokenManager = new Mock<AccessTokenManager>();
        client = new Mock<AutomowerClient>();

        target = new ChangeSettingsServiceImpl(tokenManager.object(), client.object());
    });

    it('should flag the token as invalid on changeCuttingHeight', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };

        const mowerId = 'abcd1234';
        
        tokenManager.setup(x => x.getCurrentToken()).returns(Promise.resolve(token));
        tokenManager.setup(x => x.flagAsInvalid()).returns(undefined);
        client.setup(x => x.changeSettings(mowerId, It.IsAny(), token)).throws(new NotAuthorizedError('Ouch', 'ERR0000'));

        await expect(target.changeCuttingHeight(mowerId, 1)).rejects.toThrow(NotAuthorizedError);

        tokenManager.verify(x => x.flagAsInvalid(), Times.Once());
    });

    it('should change the mower cutting height', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };

        const mowerId = 'abcd1234';
        const cuttingHeight = 1;

        tokenManager.setup(x => x.getCurrentToken()).returns(Promise.resolve(token));
        client.setup(x => x.changeSettings(mowerId, It.Is<ChangeSettingsRequest>(o => o.cuttingHeight === cuttingHeight), token)).returns(Promise.resolve(undefined));

        await target.changeCuttingHeight(mowerId, cuttingHeight);

        client.verify(o => o.changeSettings(mowerId, It.IsAny(), token), Times.Once());
    });
});