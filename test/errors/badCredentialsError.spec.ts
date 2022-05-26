import { BadConfigurationError } from '../../src/errors/badConfigurationError';
import { BadCredentialsError } from '../../src/errors/badCredentialsError';

describe('BadCredentialsError', () => {
    it('should create an instance', () => {
        const target = new BadCredentialsError('Ouch');

        expect(target).toBeDefined();
        expect(target.message).toBe('Ouch');
    });

    it('should subclass the BadConfigurationError class', () => {
        const target = new BadCredentialsError('Ouch');

        expect(target instanceof BadConfigurationError).toBeTruthy();
    });
});