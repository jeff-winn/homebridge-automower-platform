import { It, Mock, Times } from 'moq.ts';
import { AutomowerClient } from '../../../src/clients/automowerClient';
import { NotAuthorizedError } from '../../../src/errors/notAuthorizedError';
import { AccessToken } from '../../../src/model';
import { AccessTokenManager } from '../../../src/services/automower/accessTokenManager';
import { Action, MowerControlServiceImpl } from '../../../src/services/automower/mowerControlService';

describe('MowerControlService', () => {
    let target: MowerControlServiceImpl;
    let tokenManager: Mock<AccessTokenManager>;
    let client: Mock<AutomowerClient>;

    beforeEach(() => {
        tokenManager = new Mock<AccessTokenManager>();
        client = new Mock<AutomowerClient>();

        target = new MowerControlServiceImpl(tokenManager.object(), client.object());
    });

    it('should resume the mower schedule', async () => {
        const token: AccessToken = {
            provider: 'Husqvarna',
            value: 'abcd1234'
        };

        const mowerId = '1234';

        tokenManager.setup(o => o.getCurrentToken()).returns(Promise.resolve(token));
        client.setup(o => o.doAction(mowerId, It.IsAny(), token)).returns(Promise.resolve(undefined));

        await target.resumeSchedule(mowerId);

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
        
        tokenManager.setup(o => o.getCurrentToken()).returns(Promise.resolve(token));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);
        client.setup(o => o.doAction(mowerId, It.IsAny(), token)).throws(new NotAuthorizedError());

        let threw = false;
        try {
            await target.resumeSchedule(mowerId);
        } catch (e) {
            threw = true;
        }

        expect(threw).toBeTruthy();                
        tokenManager.verify(x => x.flagAsInvalid(), Times.Once());
    });

    it('should park until further notice', async () => {
        const token: AccessToken = {
            provider: 'Husqvarna',
            value: 'abcd1234'
        };

        const mowerId = '1234';

        tokenManager.setup(o => o.getCurrentToken()).returns(Promise.resolve(token));
        client.setup(o => o.doAction(mowerId, It.IsAny(), token)).returns(Promise.resolve(undefined));

        await target.parkUntilFurtherNotice(mowerId);

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
        
        tokenManager.setup(o => o.getCurrentToken()).returns(Promise.resolve(token));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);
        client.setup(o => o.doAction(mowerId, It.IsAny(), token)).throws(new NotAuthorizedError());

        let threw = false;
        try {
            await target.parkUntilFurtherNotice(mowerId);
        } catch (e) {
            threw = true;
        }

        expect(threw).toBeTruthy();                
        tokenManager.verify(x => x.flagAsInvalid(), Times.Once());
    });
});