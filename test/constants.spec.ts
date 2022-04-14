import * as constants from '../src/constants';

describe('constants', () => {
    it('should be the platform name', () => {
        // Changing this test could break the plugin and prevent upgrades.
        expect(constants.PLATFORM_NAME).toBe('Homebridge Automower Platform');
    });

    it('should be the plugin name', () => {
        // Changing this test could break the plugin and prevent upgrades.
        expect(constants.PLUGIN_ID).toBe('homebridge-automower-platform');
    });

    it('should contain the husqvarna authentication base url', () => {
        expect(constants.AUTHENTICATION_API_BASE_URL).toBe('https://api.authentication.husqvarnagroup.dev/v1');
    });

    it('should contain the husqvarna automower base url', () => {
        expect(constants.AUTOMOWER_CONNECT_API_BASE_URL).toBe('https://api.amc.husqvarna.dev/v1');
    });
});