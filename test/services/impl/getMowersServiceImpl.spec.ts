import { OAuthTokenManager } from '../../../src/authentication/oauthTokenManager';
import { AutomowerClient, Mower } from '../../../src/clients/automowerClient';
import { GetMowersServiceImpl } from '../../../src/services/impl/getMowersServiceImpl'
import { Mock, It } from 'moq.ts';
import { OAuthToken } from '../../../src/clients/authenticationClient';

describe("get mowers service", () => {
    let tokenManager: Mock<OAuthTokenManager>;
    let client: Mock<AutomowerClient>;
    let target: GetMowersServiceImpl;

    beforeEach(() => {        
        tokenManager = new Mock<OAuthTokenManager>();
        client = new Mock<AutomowerClient>();

        target = new GetMowersServiceImpl(tokenManager.object(), client.object());
    });

    it("should get all the mowers from the client", async () => {
        let token: OAuthToken = {
            access_token: "access token",
            expires_in: 50000,
            provider: "provider",
            refresh_token: "12345",
            scope: "",
            token_type: "Bearer",
            user_id: "user id"
        };

        let mower: Mower = {
            id: "abcd1234",
            type: "mower",
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
                    activity: "activity",
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: "mode",
                    state: "online"
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: "no"
                    },
                    restrictedReason: "none"    
                },
                positions: [ ],
                system: {
                    model: "12345",
                    name: "dobby",
                    serialNumber: 123456
                }
            }
        };
    
        tokenManager.setup(x => x.getCurrentToken()).returns(Promise.resolve(token));
        client.setup(x => x.getMowers(token)).returns(Promise.resolve([ mower ]));
        
        let result = await target.getMowers();

        expect(result).toBeDefined();

        let actual = result![0]!;
        expect(actual).toBeDefined();
        expect(actual).toBe(mower);
    });
});