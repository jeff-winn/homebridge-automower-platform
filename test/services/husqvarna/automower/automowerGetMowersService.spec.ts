import { Mock, Times } from 'moq.ts';

import * as model from '../../../../src/model';

import { Activity, AutomowerClient, HeadlightMode, Mode, Mower, OverrideAction, RestrictedReason, State } from '../../../../src/clients/automower/automowerClient';
import { PlatformLogger } from '../../../../src/diagnostics/platformLogger';
import { NotAuthorizedError } from '../../../../src/errors/notAuthorizedError';
import { AccessToken } from '../../../../src/model';
import { AccessTokenManager } from '../../../../src/services/husqvarna/accessTokenManager';
import { AutomowerGetMowersService } from '../../../../src/services/husqvarna/automower/automowerGetMowersService';
import { AutomowerActivityConverter } from '../../../../src/services/husqvarna/automower/converters/automowerActivityConverter';
import { AutomowerEnabledConverter } from '../../../../src/services/husqvarna/automower/converters/automowerEnabledConverter';
import { AutomowerStateConverter } from '../../../../src/services/husqvarna/automower/converters/automowerStateConverter';

describe('GetMowersServiceImpl', () => {
    let tokenManager: Mock<AccessTokenManager>;
    let enabledConverter: Mock<AutomowerEnabledConverter>;
    let activityConverter: Mock<AutomowerActivityConverter>;
    let stateConverter: Mock<AutomowerStateConverter>;
    let client: Mock<AutomowerClient>;
    let log: Mock<PlatformLogger>;
    let target: AutomowerGetMowersService;

    beforeEach(() => {        
        tokenManager = new Mock<AccessTokenManager>();
        enabledConverter = new Mock<AutomowerEnabledConverter>();
        activityConverter = new Mock<AutomowerActivityConverter>();
        stateConverter = new Mock<AutomowerStateConverter>();
        client = new Mock<AutomowerClient>();
        log = new Mock<PlatformLogger>();

        target = new AutomowerGetMowersService(tokenManager.object(), enabledConverter.object(), activityConverter.object(), 
            stateConverter.object(), client.object(), log.object());
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
                    model: 'hello 12345',
                    name: 'dobby',
                    serialNumber: 123456
                }
            }
        };
    
        tokenManager.setup(x => x.getCurrentToken()).returns(Promise.resolve(token));
        enabledConverter.setup(o => o.convert(mower)).returns(true);
        activityConverter.setup(o => o.convert(mower)).returns(model.Activity.MOWING);
        stateConverter.setup(o => o.convert(mower)).returns(model.State.IN_OPERATION);
        client.setup(x => x.getMowers(token)).returns(Promise.resolve([ mower ]));

        const result = await target.getMowers();

        expect(result).toBeDefined();

        const actual = result![0]!;

        expect(actual).toBeDefined();        
        expect(actual).toStrictEqual<model.Mower>({
            id: 'abcd1234',
            attributes: {
                location: undefined,
                battery: {
                    level: 100
                },
                connection: {
                    connected: true
                },
                metadata: {
                    manufacturer: 'hello',
                    model: '12345',
                    name: 'dobby',
                    serialNumber: '123456'
                },
                mower: {
                    activity: model.Activity.MOWING,
                    state: model.State.IN_OPERATION
                },
                schedule: {
                    runContinuously: false,
                    runInFuture: false,
                    runOnSchedule: false
                }
            }
        });
    });
});