import { It, Mock } from 'moq.ts';

import { FetchClient, Response } from '../../../src/clients/fetchClient';
import { GardenaClientImpl } from '../../../src/clients/gardena/gardenaClient';
import { BadConfigurationError } from '../../../src/errors/badConfigurationError';
import { ErrorFactory } from '../../../src/errors/errorFactory';
import { AccessToken } from '../../../src/model';

import * as constants from '../../../src/settings';

describe('GardenaClientImpl', () => {
    // These values should come from your Husqvarna account, and be placed in the .env file at the root of the workspace.
    const APPKEY = 'APPKEY';
    const LOCATION_ID = 'location1';

    let fetch: Mock<FetchClient>;
    let errorFactory: Mock<ErrorFactory>;

    let target: GardenaClientImpl;

    beforeEach(() => {
        fetch = new Mock<FetchClient>();
        errorFactory = new Mock<ErrorFactory>();

        target = new GardenaClientImpl(APPKEY, constants.GARDENA_SMART_SYSTEM_API_BASE_URL, fetch.object(), errorFactory.object());
    });

    it('should initialize correctly', () => {
        expect(target.getApplicationKey()).toBe(APPKEY);
        expect(target.getBaseUrl()).toBe(constants.GARDENA_SMART_SYSTEM_API_BASE_URL);
    });

    it('should throw an error when app key is undefined on do command', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        target = new GardenaClientImpl(undefined, constants.GARDENA_SMART_SYSTEM_API_BASE_URL, fetch.object(), errorFactory.object());

        await expect(target.doCommand('12345', { }, {
            provider: 'husqvarna',
            value: 'abcd1234'
        })).rejects.toThrowError(BadConfigurationError);
    });

    it('should execute the command successfully', async () => {
        const token: AccessToken = {
            provider: 'husqvarna',
            value: 'abcd1234'
        };

        const mowerId = '12345';
        const command = { };

        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 202,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.doCommand(mowerId, command, token)).resolves.toBeUndefined();
    });

    it('should throw an error when app key is undefined on get locations', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        target = new GardenaClientImpl(undefined, constants.GARDENA_SMART_SYSTEM_API_BASE_URL, fetch.object(), errorFactory.object());

        await expect(target.getLocations({
            provider: 'husqvarna',
            value: 'abcd1234'
        })).rejects.toThrowError(BadConfigurationError);
    });

    it('should throw an error when app key is undefined on get location', async () => {
        errorFactory.setup(o => o.badConfigurationError(It.IsAny(), It.IsAny()))
            .returns(new BadConfigurationError('hello world', '12345'));

        target = new GardenaClientImpl(undefined, constants.GARDENA_SMART_SYSTEM_API_BASE_URL, fetch.object(), errorFactory.object());

        await expect(target.getLocation(LOCATION_ID, {
            provider: 'husqvarna',
            value: 'abcd1234'
        })).rejects.toThrowError(BadConfigurationError);
    });

    it('should return undefined when empty 404 response', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };
            
        const response = new Response('{ }', {
            headers: { },
            size: 0,
            status: 404,
            timeout: 0,
            url: 'http://localhost',
        });
        
        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returnsAsync(response);
        
        await expect(target.getLocation(LOCATION_ID, token)).resolves.toBeUndefined();
    });

    it('should return undefined value when 404 response', async () => {
        const token: AccessToken = {
            value: 'value',
            provider: 'provider'
        };
            
        const response = new Response('{ }', {
            headers: { },
            size: 0,
            status: 404,
            timeout: 0,
            url: 'http://localhost',
        });
        
        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returnsAsync(response);
        
        const result = await target.getLocations(token);

        expect(result).toBeUndefined();
    });
});