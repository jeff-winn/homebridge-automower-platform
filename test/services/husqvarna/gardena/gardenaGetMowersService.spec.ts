import { Mock, Times } from 'moq.ts';
import { GardenaClient, LocationRef } from '../../../../src/clients/gardena/gardenaClient';
import { PlatformLogger } from '../../../../src/diagnostics/platformLogger';
import { NotAuthorizedError } from '../../../../src/errors/notAuthorizedError';
import { AccessToken } from '../../../../src/model';

import { AccessTokenManager } from '../../../../src/services/husqvarna/accessTokenManager';
import { GardenaGetMowersService } from '../../../../src/services/husqvarna/gardena/gardenaGetMowersService';

describe('GardenaGetMowersService', () => {
    let tokenManager: Mock<AccessTokenManager>;
    let client: Mock<GardenaClient>;
    let log: Mock<PlatformLogger>;
    let target: GardenaGetMowersService;

    beforeEach(() => {
        tokenManager = new Mock<AccessTokenManager>();
        client = new Mock<GardenaClient>();

        log = new Mock<PlatformLogger>();
        log.setup(o => o.warn('GARDENA_PREVIEW_IN_USE')).returns(undefined);

        target = new GardenaGetMowersService(tokenManager.object(), client.object(), log.object());
    });

    afterEach(() => {
        log.verify(o => o.warn('GARDENA_PREVIEW_IN_USE'), Times.Once());
    });

    it('should flag the token as invalid if not authorized', async () => {
        tokenManager.setup(o => o.getCurrentToken()).throws(new NotAuthorizedError('Unable to authenticate', 'ERR0000'));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);

        await expect(target.getMowers()).rejects.toThrowError(NotAuthorizedError);

        tokenManager.verify(o => o.flagAsInvalid(), Times.Once());
    });

    it('should return an array of values', async () => {
        const token: AccessToken = {
            provider: 'husqvarna',
            value: '12345'
        };

        const locationRef: LocationRef = {
            id: 'abcd1234',
            type: 'LOCATION',
            attributes: {
                name: 'My Garden'
            }
        };

        tokenManager.setup(o => o.getCurrentToken()).returnsAsync(token);
        client.setup(o => o.getLocations(token)).returnsAsync([ locationRef ]);
        client.setup(o => o.getLocation('abcd1234', token)).returnsAsync({
            id: 'abcd1234',
            type: 'TBD',
            attributes: {
                name: 'My Garden'
            },
            relationships: []
        });

        const result = await target.getMowers();
        expect(result).toBeDefined();
    });
});