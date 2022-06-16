import { BadConfigurationError } from '../../src/errors/badConfigurationError';
import { BadCredentialsError } from '../../src/errors/badCredentialsError';

describe('BadCredentialsError', () => {
    it('should create an instance', () => {
        const message = 'Ouch';
        const errorCode = 'ERR0000';

        const target = new BadCredentialsError(message, errorCode);

        expect(target).toBeDefined();
        expect(target.message).toBe(message);
        expect(target.errorCode).toBe(errorCode);
    });

    it('should subclass the BadConfigurationError class', () => {
        const target = new BadCredentialsError('Ouch', 'ERR0000');

        expect(target instanceof BadConfigurationError).toBeTruthy();
    });
});