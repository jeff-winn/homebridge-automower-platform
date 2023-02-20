import { Mock } from 'moq.ts';
import { FetchClient } from '../../../src/clients/fetchClient';

import { GardenaClientImpl } from '../../../src/clients/gardena/gardenaClient';
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
});