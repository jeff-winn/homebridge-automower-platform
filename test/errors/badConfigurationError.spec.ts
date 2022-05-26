import { BadConfigurationError } from '../../src/errors/badConfigurationError';

describe('BadConfigurationError', () => {
    it('should create an instance', () => {
        const target = new BadConfigurationError('Ouch');

        expect(target).toBeDefined();
        expect(target.message).toBe('Ouch');
    });
});