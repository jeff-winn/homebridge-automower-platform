import { Mock, Times } from 'moq.ts';

import { Activity, AutomowerClient, HeadlightMode, Mode, Mower, OverrideAction, RestrictedReason, State } from '../../../../src/clients/automower/automowerClient';
import { NotAuthorizedError } from '../../../../src/errors/notAuthorizedError';
import { AccessToken } from '../../../../src/model';
import { AccessTokenManager } from '../../../../src/services/husqvarna/accessTokenManager';
import { GetMowersServiceImpl } from '../../../../src/services/husqvarna/automower/getMowersService';

describe('GetMowersServiceImpl', () => {
    let tokenManager: Mock<AccessTokenManager>;
    let client: Mock<AutomowerClient>;
    let target: GetMowersServiceImpl;

    beforeEach(() => {        
        tokenManager = new Mock<AccessTokenManager>();
        client = new Mock<AutomowerClient>();

        target = new GetMowersServiceImpl(tokenManager.object(), client.object());
    });

    it('should flag the token as invalid on getMower', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };

        const mowerId = 'abcd1234';
        
        tokenManager.setup(x => x.getCurrentToken()).returns(Promise.resolve(token));
        tokenManager.setup(x => x.flagAsInvalid()).returns(undefined);
        client.setup(x => x.getMower(mowerId, token)).throws(new NotAuthorizedError('Ouch', 'ERR0000'));

        await expect(target.getMower(mowerId)).rejects.toThrow(NotAuthorizedError);

        tokenManager.verify(x => x.flagAsInvalid(), Times.Once());
    });

    it('should flag the token as invalid on getMowers', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };
        
        tokenManager.setup(x => x.getCurrentToken()).returns(Promise.resolve(token));
        tokenManager.setup(x => x.flagAsInvalid()).returns(undefined);
        client.setup(x => x.getMowers(token)).throws(new NotAuthorizedError('Ouch', 'ERR0000'));

        await expect(target.getMowers()).rejects.toThrow(NotAuthorizedError);

        tokenManager.verify(x => x.flagAsInvalid(), Times.Once());
    });

    it('should get a single mower from the client', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };

        const mowerId = 'abcd1234';

        const mower: Mower = {
            id: mowerId,
            type: 'mower',
            attributes: {
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ ]
                },
                metadata: {
                    connected: true,
                    statusTimestamp: 100
                },
                mower: {
                    activity: Activity.MOWING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: OverrideAction.NOT_ACTIVE
                    },
                    restrictedReason: RestrictedReason.NOT_APPLICABLE
                },
                positions: [ ],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 0,
                    numberOfCollisions: 0,
                    totalChargingTime: 0,
                    totalCuttingTime: 0,
                    totalRunningTime: 0,
                    totalSearchingTime: 0
                },
                system: {
                    model: '12345',
                    name: 'dobby',
                    serialNumber: 123456
                }
            }
        };
    
        tokenManager.setup(x => x.getCurrentToken()).returns(Promise.resolve(token));
        client.setup(x => x.getMower(mowerId, token)).returns(Promise.resolve(mower));
        
        const actual = await target.getMower(mowerId);

        expect(actual).toBeDefined();
        expect(actual).toBe(mower);
    });

    it('should get all the mowers from the client', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };

        const mower: Mower = {
            id: 'abcd1234',
            type: 'mower',
            attributes: {
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ ]
                },
                metadata: {
                    connected: true,
                    statusTimestamp: 100
                },
                mower: {
                    activity: Activity.MOWING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: OverrideAction.NO_SOURCE
                    },
                    restrictedReason: RestrictedReason.NOT_APPLICABLE
                },
                positions: [ ],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 0,
                    numberOfCollisions: 0,
                    totalChargingTime: 0,
                    totalCuttingTime: 0,
                    totalRunningTime: 0,
                    totalSearchingTime: 0
                },
                system: {
                    model: '12345',
                    name: 'dobby',
                    serialNumber: 123456
                }
            }
        };
    
        tokenManager.setup(x => x.getCurrentToken()).returns(Promise.resolve(token));
        client.setup(x => x.getMowers(token)).returns(Promise.resolve([ mower ]));

        const result = await target.getMowers();

        expect(result).toBeDefined();

        const actual = result![0]!;
        expect(actual).toBeDefined();
        expect(actual).toBe(mower);
    });
});