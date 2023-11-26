import { It, Mock, Times } from 'moq.ts';

import { AutomowerClient } from '../../../../src/clients/automower/automowerClient';
import { NotAuthorizedError } from '../../../../src/errors/notAuthorizedError';
import { AccessToken } from '../../../../src/model';
import { AccessTokenManager } from '../../../../src/services/husqvarna/accessTokenManager';
import { Action, AutomowerMowerControlService } from '../../../../src/services/husqvarna/automower/automowerMowerControlService';

describe('AutomowerMowerControlService', () => {
    let target: AutomowerMowerControlService;
    let tokenManager: Mock<AccessTokenManager>;
    let client: Mock<AutomowerClient>;

    beforeEach(() => {
        tokenManager = new Mock<AccessTokenManager>();
        client = new Mock<AutomowerClient>();

        target = new AutomowerMowerControlService(tokenManager.object(), client.object());
    });

    it('should pause the mower', async () => {
        const token: AccessToken = {
            provider: 'Husqvarna',
            value: 'abcd1234'
        };

        const mowerId = '1234';

        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        client.setup(o => o.doAction(mowerId, It.IsAny(), token)).returns(Promise.resolve(undefined));

        await target.pause(mowerId);

        client.verify(o => o.doAction(mowerId, 
            It.Is<Action>(action => action.type === 'Pause'), 
            token), Times.Once());
    });

    it('should flag the token as invalid when pausing the mower', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };

        const mowerId = '12345';
        
        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);
        client.setup(o => o.doAction(mowerId, It.IsAny(), token)).throws(new NotAuthorizedError('Ouch', 'ERR0000'));

        await expect(target.pause(mowerId)).rejects.toThrow(NotAuthorizedError);

        tokenManager.verify(x => x.flagAsInvalid(), Times.Once());
    });

    it('should resume the mower schedule', async () => {
        const token: AccessToken = {
            provider: 'Husqvarna',
            value: 'abcd1234'
        };

        const mowerId = '1234';

        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        client.setup(o => o.doAction(mowerId, It.IsAny(), token)).returns(Promise.resolve(undefined));

        await target.resume(mowerId);

        client.verify(o => o.doAction(mowerId, 
            It.Is<Action>(action => action.type === 'ResumeSchedule'), 
            token), Times.Once());
    });

    it('should flag the token as invalid when resuming the mower schedule', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };

        const mowerId = '12345';
        
        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);
        client.setup(o => o.doAction(mowerId, It.IsAny(), token)).throws(new NotAuthorizedError('Ouch', 'ERR0000'));

        await expect(target.resume(mowerId)).rejects.toThrow(NotAuthorizedError);

        tokenManager.verify(x => x.flagAsInvalid(), Times.Once());
    });

    it('should park until further notice', async () => {
        const token: AccessToken = {
            provider: 'Husqvarna',
            value: 'abcd1234'
        };

        const mowerId = '1234';

        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        client.setup(o => o.doAction(mowerId, It.IsAny(), token)).returns(Promise.resolve(undefined));

        await target.park(mowerId);

        client.verify(o => o.doAction(mowerId, 
            It.Is<Action>(action => action.type === 'ParkUntilFurtherNotice'), 
            token), Times.Once());
    });

    it('should flag the token as invalid when parking until further notice', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };

        const mowerId = '12345';
        
        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);
        client.setup(o => o.doAction(mowerId, It.IsAny(), token)).throws(new NotAuthorizedError('Ouch', 'ERR0000'));

        await expect(target.park(mowerId)).rejects.toThrow(NotAuthorizedError);

        tokenManager.verify(x => x.flagAsInvalid(), Times.Once());
    });
});