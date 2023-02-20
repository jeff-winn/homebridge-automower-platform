import { It, Mock } from 'moq.ts';
import { FetchClient } from '../../../src/clients/fetchClient';

import { GardenaClientImpl } from '../../../src/clients/gardena/gardenaClient';
import { BadConfigurationError } from '../../../src/errors/badConfigurationError';
import { ErrorFactory } from '../../../src/errors/errorFactory';

import * as constants from '../../../src/settings';

describe('GardenaClientImpl', () => {
    // These values should come from your Husqvarna account, and be placed in the .env file at the root of the workspace.
    const APPKEY: string = process.env.HUSQVARNA_APPKEY || 'APPKEY';
    const MOWER_ID: string = process.env.MOWER_ID || '12345';

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

        await expect(target.getLocation(MOWER_ID, {
            provider: 'husqvarna',
            value: 'abcd1234'
        })).rejects.toThrowError(BadConfigurationError);
    });
});