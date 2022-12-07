import { Mock } from 'moq.ts';
import { Environment } from '../../src/primitives/environment';
import { Y18nLocalization } from '../../src/primitives/localization';

describe('Y18nLocalization', () => {
    let env: Mock<Environment>;
    let target: Y18nLocalization;

    beforeEach(() => {
        env = new Mock<Environment>();
        env.setup(o => o.getPackageRoot()).returns('./');

        target = new Y18nLocalization('en', env.object());
    });

    /**
     * This uses value replacements within the string and does not require the entire string to be in the translation.
     */
    it('should handle value replacements correctly', () => {
        const event = 'test';
        const result = target.format('RECEIVED_UNKNOWN_EVENT', event);

        expect(result).toBe('Received unknown event: test');
    });

    /**
     * This uses string interpolation and does require the entire string (post-interpolated string) to be in the translation.
     */
    it('should handle string interpolation correctly', () => {        
        const value = 'ON';        
        const result = target.format(`Changed '%s' for '%s': ${value}`, 'test', 'test');

        expect(result).toBe('Changed \'test\' for \'test\': ON');
    });
});