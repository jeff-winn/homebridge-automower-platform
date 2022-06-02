import { Mock } from 'moq.ts';

import { AutomowerClientImpl } from '../../src/clients/automowerClient';
import { BadConfigurationError } from '../../src/errors/badConfigurationError';
import { FetchClient } from '../../src/primitives/fetchClient';
import * as constants from '../../src/settings';

describe('AutomowerClientImpl', () => {
    // These values should come from your Husqvarna account, and be placed in the .env file at the root of the workspace.
    const APPKEY: string = process.env.HUSQVARNA_APPKEY || 'APPKEY';
    const MOWER_ID: string = process.env.MOWER_ID || '12345';

    let fetch: Mock<FetchClient>;
    let target: AutomowerClientImpl;

    beforeEach(() => {
        fetch = new Mock<FetchClient>();

        target = new AutomowerClientImpl(APPKEY, constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object());
    });

    it('should initialize correctly', () => {
        expect(target.getApplicationKey()).toBe(APPKEY);
        expect(target.getBaseUrl()).toBe(constants.AUTOMOWER_CONNECT_API_BASE_URL);
    });

    it('should throw an error when app key is undefined on doAction', async () => {
        target = new AutomowerClientImpl(undefined, constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object());

        let thrown = false;

        try {
            await target.doAction(MOWER_ID, { }, {
                value: 'value',
                provider: 'provider'
            });
        } catch (e) {
            if (e instanceof BadConfigurationError) {
                thrown = true;
            }
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when app key is empty on doAction', async () => {
        target = new AutomowerClientImpl('', constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object());

        let thrown = false;

        try {
            await target.doAction(MOWER_ID, { }, {
                value: 'value',
                provider: 'provider'
            });
        } catch (e) {
            if (e instanceof BadConfigurationError) {
                thrown = true;
            }
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when the app key is undefined on getMower', async () => {
        target = new AutomowerClientImpl(undefined, constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object());

        let thrown = false;

        try {
            await target.getMower(MOWER_ID, {
                value: 'value',
                provider: 'provider'
            });
        } catch (e) {
            if (e instanceof BadConfigurationError) {
                thrown = true;
            }
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when the app key is empty on getMower', async () => {
        target = new AutomowerClientImpl('', constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object());

        let thrown = false;       

        try {
            await target.getMower(MOWER_ID, {
                value: 'value',
                provider: 'provider'
            });
        } catch (e) {
            if (e instanceof BadConfigurationError) {
                thrown = true;
            }
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when the app key is undefined on getMowers', async () => {
        target = new AutomowerClientImpl(undefined, constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object());

        let thrown = false;

        try {
            await target.getMowers({
                value: 'value',
                provider: 'provider'
            });
        } catch (e) {
            if (e instanceof BadConfigurationError) {
                thrown = true;
            }
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when the app key is empty on getMowers', async () => {
        target = new AutomowerClientImpl('', constants.AUTOMOWER_CONNECT_API_BASE_URL, fetch.object());

        let thrown = false;       

        try {
            await target.getMowers({
                value: 'value',
                provider: 'provider'
            });
        } catch (e) {
            if (e instanceof BadConfigurationError) {
                thrown = true;
            }
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when the mower id is empty on doAction', async () => {
        let thrown = false;

        try {
            await target.doAction('', { }, {
                value: 'value',
                provider: 'provider'
            });
        } catch (e) {
            thrown = true;
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when the mower id is empty on getMower', async () => {
        let thrown = false;

        try {
            await target.getMower('', {
                value: 'value',
                provider: 'provider'
            });
        } catch (e) {
            thrown = true;
        }

        expect(thrown).toBeTruthy();
    });    
});
