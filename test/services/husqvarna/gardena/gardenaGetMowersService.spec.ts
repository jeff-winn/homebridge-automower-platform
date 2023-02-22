import { Mock, Times } from 'moq.ts';
import { GardenaClient, LocationSearchRef, ThingType } from '../../../../src/clients/gardena/gardenaClient';
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

    it('always returns an undefined value for get mower', async () => {
        await expect(target.getMower('any')).resolves.toBeUndefined();
    });

    it('should flag the token as invalid if not authorized', async () => {
        tokenManager.setup(o => o.getCurrentToken()).throws(new NotAuthorizedError('Unable to authenticate', 'ERR0000'));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);

        await expect(target.getMowers()).rejects.toThrowError(NotAuthorizedError);

        tokenManager.verify(o => o.flagAsInvalid(), Times.Once());
        log.verify(o => o.warn('GARDENA_PREVIEW_IN_USE'), Times.Once());
    });

    it('should return an empty array when no locations are found', async () => {
        const token: AccessToken = {
            provider: 'husqvarna',
            value: '12345'
        };

        tokenManager.setup(o => o.getCurrentToken()).returnsAsync(token);
        client.setup(o => o.getLocations(token)).returnsAsync([ ]);        

        const result = await target.getMowers();
        expect(result).toBeDefined();
        expect(result).toHaveLength(0);

        log.verify(o => o.warn('GARDENA_PREVIEW_IN_USE'), Times.Once());
    });

    it('should return an array of values', async () => {
        const token: AccessToken = {
            provider: 'husqvarna',
            value: '12345'
        };

        const locationRef: LocationSearchRef = {
            id: 'abcd1234',
            type: ThingType.LOCATION,
            attributes: {
                name: 'Tommy Boy'
            }
        };

        tokenManager.setup(o => o.getCurrentToken()).returnsAsync(token);
        client.setup(o => o.getLocations(token)).returnsAsync({
            data: [
                locationRef
            ]
        });
        client.setup(o => o.getLocation('abcd1234', token)).returnsAsync({
            data: {
                id: 'abcd1234',
                type: ThingType.DEVICE,
                attributes: {
                    name: 'My Garden'
                },
                relationships: {
                    devices: {
                        data: []
                    }
                }
            },
            included: []
        });

        const result = await target.getMowers();
        expect(result).toBeDefined();

        log.verify(o => o.warn('GARDENA_PREVIEW_IN_USE'), Times.Once());
    });
});