import { Mock, Times } from 'moq.ts';

import { AccessTokenManager } from '../../../src/authentication/accessTokenManager';
import { AutomowerClient } from '../../../src/clients/automowerClient';
import { NotAuthorizedError } from '../../../src/errors/notAuthorizedError';
import { Mower, AccessToken } from '../../../src/clients/model';
import { GetMowersServiceImpl } from '../../../src/services/automower/getMowersService';

describe('getMowersServiceImpl', () => {
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
        client.setup(x => x.getMower(mowerId, token)).throws(new NotAuthorizedError());

        let threw = false;
        try {
            await target.getMower(mowerId);
        } catch (e) {
            threw = true;
        }

        expect(threw).toBeTruthy();                
        tokenManager.verify(x => x.flagAsInvalid(), Times.Once());
    });

    it('should flag the token as invalid on getMowers', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };
        
        tokenManager.setup(x => x.getCurrentToken()).returns(Promise.resolve(token));
        tokenManager.setup(x => x.flagAsInvalid()).returns(undefined);
        client.setup(x => x.getMowers(token)).throws(new NotAuthorizedError());

        let threw = false;
        try {
            await target.getMowers();
        } catch (e) {
            threw = true;
        }

        expect(threw).toBeTruthy();                
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
                    activity: 'activity',
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: 'mode',
                    state: 'online'
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: 'no'
                    },
                    restrictedReason: 'none'    
                },
                positions: [ ],
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
                    activity: 'activity',
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: 'mode',
                    state: 'online'
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: 'no'
                    },
                    restrictedReason: 'none'    
                },
                positions: [ ],
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