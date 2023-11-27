import { It, Mock, Times } from 'moq.ts';

import { GardenaClient } from '../../../../src/clients/gardena/gardenaClient';
import { BadConfigurationError } from '../../../../src/errors/badConfigurationError';
import { NotAuthorizedError } from '../../../../src/errors/notAuthorizedError';
import { AccessToken } from '../../../../src/model';
import { AccessTokenManager } from '../../../../src/services/husqvarna/accessTokenManager';
import { CommandType, GardenaManualMowerControlService, MowerCommand, MowerCommandType } from '../../../../src/services/husqvarna/gardena/gardenaMowerControlService';

describe('GardenaManualMowerControlService', () => {
    let tokenManager: Mock<AccessTokenManager>;
    let client: Mock<GardenaClient>;

    let target: GardenaManualMowerControlService;

    beforeEach(() => {
        tokenManager = new Mock<AccessTokenManager>();
        client = new Mock<GardenaClient>();

        target = new GardenaManualMowerControlService(tokenManager.object(), client.object());
    });

    it('should start manual mowing', async () => {
        const token: AccessToken = {
            provider: 'Husqvarna',
            value: 'abcd1234'
        };

        const mowerId = '1234';
        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        client.setup(o => o.doCommand(mowerId, It.IsAny(), token)).returns(Promise.resolve(undefined));        

        await expect(target.resumeAsync(mowerId)).resolves.toBeUndefined();

        client.verify(o => o.doCommand(mowerId, It.Is<MowerCommand>(x => 
            x.type === CommandType.MOWER_CONTROL && 
            x.attributes.command === MowerCommandType.START_SECONDS_TO_OVERRIDE && 
            x.attributes.seconds === 21600), 
        token), Times.Once());
    });

    it('should flag the token as invalid when resuming the mower', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };

        const mowerId = '12345';
        
        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);
        client.setup(o => o.doCommand(mowerId, It.IsAny(), token)).throws(new NotAuthorizedError('Ouch', 'ERR0000'));

        await expect(target.resumeAsync(mowerId)).rejects.toThrow(NotAuthorizedError);

        tokenManager.verify(x => x.flagAsInvalid(), Times.Once());
    });

    it('should rethrow any error when resuming the mower', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };

        const mowerId = '12345';
        
        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);
        client.setup(o => o.doCommand(mowerId, It.IsAny(), token)).throws(new BadConfigurationError('Ouch', 'ERR0000'));

        await expect(target.resumeAsync(mowerId)).rejects.toThrow(BadConfigurationError);

        tokenManager.verify(x => x.flagAsInvalid(), Times.Never());
    });

    it('should park the mower until further notice', async () => {
        const token: AccessToken = {
            provider: 'Husqvarna',
            value: 'abcd1234'
        };

        const mowerId = '1234';
        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        client.setup(o => o.doCommand(mowerId, It.IsAny(), token)).returns(Promise.resolve(undefined));        

        await expect(target.park(mowerId)).resolves.toBeUndefined();

        client.verify(o => o.doCommand(mowerId, It.Is<MowerCommand>(x => 
            x.type === CommandType.MOWER_CONTROL && 
            x.attributes.command === MowerCommandType.PARK_UNTIL_FURTHER_NOTICE), 
        token), Times.Once());
    });

    it('should flag the token as invalid when parking the mower', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };

        const mowerId = '12345';
        
        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);
        client.setup(o => o.doCommand(mowerId, It.IsAny(), token)).throws(new NotAuthorizedError('Ouch', 'ERR0000'));

        await expect(target.park(mowerId)).rejects.toThrow(NotAuthorizedError);

        tokenManager.verify(x => x.flagAsInvalid(), Times.Once());
    });

    it('should rethrow any error when parking the mower', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };

        const mowerId = '12345';
        
        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);
        client.setup(o => o.doCommand(mowerId, It.IsAny(), token)).throws(new BadConfigurationError('Ouch', 'ERR0000'));

        await expect(target.park(mowerId)).rejects.toThrow(BadConfigurationError);

        tokenManager.verify(x => x.flagAsInvalid(), Times.Never());
    });
});