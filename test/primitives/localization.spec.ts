import { Y18nLocalization } from '../../src/primitives/localization';

describe('Y18nLocalization', () => {
    let target: Y18nLocalization;

    beforeEach(() => {
        target = new Y18nLocalization('en');
    });

    /**
     * This uses value replacements within the string and does not require the entire string to be in the translation.
     */
    it('should handle value replacements correctly', () => {
        const event = 'test';
        const result = target.format('Received unknown event: %s', event);

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