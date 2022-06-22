import { Y18nLocalization } from '../../src/primitives/localization';

describe('Y18nLocalization', () => {
    let target: Y18nLocalization;

    beforeEach(() => {
        target = new Y18nLocalization('test');
    });

    /**
     * This uses value replacements within the string and does not require the entire string to be in the translation.
     */
    it('should handle value replacements correctly', () => {
        const world = 'world';
        const result = target.format('Hello %s!', world);

        expect(result).toBe('Bonjour world!');
    });

    /**
     * This uses string interpolation and does require the entire string (post-interpolated string) to be in the translation.
     */
    it('should handle string interpolation correctly', () => {        
        const world = 'world';        
        const result = target.format(`Hello ${world}!`);

        expect(result).toBe('Bonjour le monde!');
    });
});