import { It, Mock } from 'moq.ts';

import {
    Activity, AutomowerClientImpl, ChangeSettingsRequest, ErrorResponse,
    GetMowerResponse, GetMowersResponse, HeadlightMode, Mode, Mower, RestrictedReason, State
} from '../../../src/clients/automower/automowerClient';
import { FetchClient, Response } from '../../../src/clients/fetchClient';
import { BadConfigurationError } from '../../../src/errors/badConfigurationError';
import { ErrorFactory } from '../../../src/errors/errorFactory';
import { NotAuthorizedError } from '../../../src/errors/notAuthorizedError';
import { UnexpectedServerError } from '../../../src/errors/unexpectedServerError';
import { AccessToken } from '../../../src/model';

import * as constants from '../../../src/settings';

describe('AutomowerClientImpl', () => {
    // These values should come from your Husqvarna account, and be placed in the .env file at the root of the workspace.
    const APPKEY = 'APPKEY';
    const MOWER_ID = '12345';

    let fetch: Mock<FetchClient>;
    let errorFactory: Mock<ErrorFactory>;
    let target: AutomowerClientImpl;

    beforeEach(() => {
        fetch = new Mock<FetchClient>();
        errorFactory = new Mock<ErrorFactory>();

        target = new AutomowerClientImpl(APPKEY, constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object(), errorFactory.object());
    });

    it('should initialize correctly', () => {
        expect(target.getApplicationKey()).toBe(APPKEY);
        expect(target.getBaseUrl()).toBe(constants.AUTOMOWER_CONNECT_API_BASE_URL);
    });

    it('should throw an error when app key is undefined on doAction', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        target = new AutomowerClientImpl(undefined, constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object(), errorFactory.object());

        await expect(target.doAction(MOWER_ID, { }, {
            value: 'value',
            provider: 'provider'
        })).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when app key is empty on doAction', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        target = new AutomowerClientImpl('', constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object(), errorFactory.object());

        await expect(target.doAction(MOWER_ID, { }, {
            value: 'value',
            provider: 'provider'
        })).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the app key is undefined on getMower', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        target = new AutomowerClientImpl(undefined, constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object(), errorFactory.object());

        await expect(target.getMower(MOWER_ID, {
            value: 'value',
            provider: 'provider'
        })).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the app key is empty on getMower', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        target = new AutomowerClientImpl('', constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object(), errorFactory.object());

        await expect(target.getMower(MOWER_ID, {
            value: 'value',
            provider: 'provider'
        })).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the app key is undefined on getMowers', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        target = new AutomowerClientImpl(undefined, constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object(), errorFactory.object());

        await expect(target.getMowers({
            value: 'value',
            provider: 'provider'
        })).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when the app key is empty on getMowers', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));
        
        target = new AutomowerClientImpl('', constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object(), errorFactory.object());

        await expect(target.getMowers({
            value: 'value',
            provider: 'provider'
        })).rejects.toThrow(BadConfigurationError);
    });

    it('should throw an error when the action is undefined on doAction', async () => {
        await expect(target.doAction(MOWER_ID, undefined, {
            value: 'value',
            provider: 'provider'
        })).rejects.toThrowError();
    });

    it('should throw an error when the mower id is empty on doAction', async () => {
        await expect(target.doAction('', { }, {
            value: 'value',
            provider: 'provider'
        })).rejects.toThrowError();
    });

    it('should throw an error when the mower id is empty on getMower', async () => {
        await expect(target.getMower('', {
            value: 'value',
            provider: 'provider'
        })).rejects.toThrowError();
    });

    it('should return without error when successful', async () => {
        const action = {
            type: 'ResumeSchedule'
        };

        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };

        const response = new Response('{ "hello": "world" }', {
            headers: { },
            size: 0,
            status: 200,
            statusText: 'OK',
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.doAction(MOWER_ID, action, token)).resolves.toBeUndefined();
    });

    it('should throw not authorized on 401 response from doAction', async () => {
        errorFactory.setup(o => o.notAuthorizedError(It.IsAny(), It.IsAny()))
            .returns(new NotAuthorizedError('hello world', '12345'));

        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };
            
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 401,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        
        await expect(target.doAction(MOWER_ID, {
            type: 'go'
        }, token)).rejects.toThrowError(NotAuthorizedError);
    });
    
    it('should throw an error when response not ok from doAction', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };
            
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 503,
            statusText: 'We are not here',
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        
        await expect(target.doAction(MOWER_ID, {
            type: 'go'
        }, token)).rejects.toThrowError();
    });

    it('should throw an error when response not ok from getMower', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };
            
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 503,
            statusText: 'We are not here',
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        
        await expect(target.getMower(MOWER_ID, token)).rejects.toThrowError();
    });

    it('should throw not authorized on 401 response from getMower', async () => {
        errorFactory.setup(o => o.notAuthorizedError(It.IsAny(), It.IsAny()))
            .returns(new NotAuthorizedError('hello world', '12345'));

        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };
            
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 401,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        
        await expect(target.getMower(MOWER_ID, token)).rejects.toThrowError(NotAuthorizedError);
    });

    it('should return undefined when empty 200 response', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };
            
        const response = new Response('{ }', {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });
        
        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        
        await expect(target.getMower(MOWER_ID, token)).resolves.toBeUndefined();
    });

    it('should return undefined when 404 response', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };
            
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 404,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        
        await expect(target.getMower(MOWER_ID, token)).resolves.toBeUndefined();
    });

    it('should return a value when 200 response on getMower', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };
        
        const mower: Mower = {
            id: MOWER_ID,
            type: 'get',
            attributes: {
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: []
                },
                capabilities: {
                    canConfirmError: false,
                    headlights: true,
                    position: true,
                    stayOutZones: false,
                    workAreas: false
                },
                metadata: {
                    connected: true,
                    statusTimestamp: 1
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
                    override: {},
                    restrictedReason: RestrictedReason.NONE
                },
                positions: [],
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
                    model: 'model',
                    name: 'name',
                    serialNumber: 12345
                }
            }        
        };

        const r: GetMowerResponse = {
            data: mower
        };

        const body = JSON.stringify(r);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        
        await expect(target.getMower(MOWER_ID, token)).resolves.toStrictEqual(mower);
    });

    it('should return an empty array on getMowers', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };

        const mowers: Mower[] = [ ];

        const r: GetMowersResponse = {
            data: mowers
        };

        const body = JSON.stringify(r);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.getMowers(token)).resolves.toStrictEqual(mowers);
    });

    it('should return a single value on getMowers', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };

        const mowers: Mower[] = [
            {
                id: '1',
                type: 'get',
                attributes: {
                    battery: {
                        batteryPercent: 100
                    },
                    calendar: {
                        tasks: []
                    },
                    capabilities: {
                        canConfirmError: false,
                        headlights: true,
                        position: true,
                        stayOutZones: false,
                        workAreas: false
                    },
                    metadata: {
                        connected: true,
                        statusTimestamp: 1
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
                        override: {},
                        restrictedReason: RestrictedReason.NONE
                    },
                    positions: [],
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
                        model: 'model',
                        name: 'name',
                        serialNumber: 12345
                    }
                }  
            }
        ];

        const r: GetMowersResponse = {
            data: mowers
        };

        const body = JSON.stringify(r);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.getMowers(token)).resolves.toStrictEqual(mowers);
    });

    it('should return multiple values on getMowers', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };

        const mowers: Mower[] = [
            {
                id: '1',
                type: 'get',
                attributes: {
                    battery: {
                        batteryPercent: 100
                    },
                    calendar: {
                        tasks: []
                    },
                    capabilities: {
                        canConfirmError: false,
                        headlights: true,
                        position: true,
                        stayOutZones: false,
                        workAreas: false
                    },
                    metadata: {
                        connected: true,
                        statusTimestamp: 1
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
                        override: {},
                        restrictedReason: RestrictedReason.NONE
                    },
                    positions: [],
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
                        model: 'model',
                        name: 'name',
                        serialNumber: 12345
                    }
                }  
            },
            {
                id: '2',
                type: 'get',
                attributes: {
                    battery: {
                        batteryPercent: 100
                    },
                    calendar: {
                        tasks: []
                    },
                    capabilities: {
                        canConfirmError: false,
                        headlights: true,
                        position: true,
                        stayOutZones: false,
                        workAreas: false
                    },
                    metadata: {
                        connected: true,
                        statusTimestamp: 1
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
                        override: {},
                        restrictedReason: RestrictedReason.NONE
                    },
                    positions: [],
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
                        model: 'model',
                        name: 'name',
                        serialNumber: 12345
                    }
                }  
            }
        ];

        const r: GetMowersResponse = {
            data: mowers
        };

        const body = JSON.stringify(r);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.getMowers(token)).resolves.toStrictEqual(mowers);
    });

    it('should throw an error when response not ok on getMowers', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };

        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 503,
            statusText: 'We are not here',
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        
        await expect(target.getMower(MOWER_ID, token)).rejects.toThrowError();
    });
    
    it('should throw an unexpected server error on 500 response on getMowers when errors is undefined', async () => {
        errorFactory.setup(o => o.unexpectedServerError(It.IsAny(), It.IsAny(), It.IsAny()))
            .returns(new UnexpectedServerError('hello world', '12345'));

        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };

        const body = JSON.stringify({ });

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 500,
            statusText: 'We are not here',
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.getMowers(token)).rejects.toThrowError(UnexpectedServerError);
    });

    it('should throw an unexpected server error on 500 response on getMowers when errors is empty', async () => {
        errorFactory.setup(o => o.unexpectedServerError(It.IsAny(), It.IsAny(), It.IsAny()))
            .returns(new UnexpectedServerError('hello world', '12345'));

        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };

        const r: ErrorResponse = {
            errors: []
        };

        const body = JSON.stringify(r);
        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 500,
            statusText: 'We are not here',
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.getMowers(token)).rejects.toThrowError(UnexpectedServerError);
    });

    it('should throw an unexpected server error on 500 response on getMowers without error details', async () => {
        errorFactory.setup(o => o.unexpectedServerError(It.IsAny(), It.IsAny(), It.IsAny()))
            .returns(new UnexpectedServerError('hello world', '12345'));

        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };

        const r: ErrorResponse = { errors: [ ] };
        const body = JSON.stringify(r);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 500,
            statusText: 'We are not here',
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.getMowers(token)).rejects.toThrowError(UnexpectedServerError);
    });
    
    it('should throw an unexpected server error on 500 response on getMowers with error details', async () => {
        errorFactory.setup(o => o.unexpectedServerError(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()))
            .returns(new UnexpectedServerError('hello world', '12345'));

        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };

        const r: ErrorResponse = {
            errors: [
                {
                    code: '0',
                    detail: 'detail',
                    id: '12345',
                    status: 'hello world',
                    title: 'broken'
                }
            ]
        };

        const body = JSON.stringify(r);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 500,
            statusText: 'We are not here',
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.getMowers(token)).rejects.toThrowError(UnexpectedServerError);
    });

    it('should throw an error when id is empty on change settings', async () => {
        const request: ChangeSettingsRequest = { };

        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };

        await expect(target.changeSettings('', request, token)).rejects.toThrowError();
    });

    it('should throw an error when app key is undefined on changeSettings', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };

        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        target = new AutomowerClientImpl(undefined, constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object(), errorFactory.object());

        await expect(target.changeSettings('12345', { }, token)).rejects.toThrowError(BadConfigurationError);
    });
    
    it('should throw an error for 500 response on changeSettings', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };

        const r: ErrorResponse = {
            errors: [
                {
                    code: '0',
                    detail: 'detail',
                    id: '12345',
                    status: 'hello world',
                    title: 'broken'
                }
            ]
        };

        const body = JSON.stringify(r);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 500,
            statusText: 'We are not here',
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        errorFactory.setup(o => o.unexpectedServerError(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()))
            .returns(new UnexpectedServerError('hello world', '12345'));

        await expect(target.changeSettings('12345', { }, token)).rejects.toThrow(UnexpectedServerError);
    });
    
    it('should return successfully on changeSettings', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };

        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.changeSettings('12345', { }, token)).resolves.toBeUndefined();
    });
});
