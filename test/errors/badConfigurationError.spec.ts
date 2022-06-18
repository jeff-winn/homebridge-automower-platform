import { BadConfigurationError } from '../../src/errors/badConfigurationError';

describe('BadConfigurationError', () => {
    it('should create an instance', () => {
        const errorCode = 'ERR0000';
        const message = 'Ouch';

        const target = new BadConfigurationError(message, errorCode);

        expect(target).toBeDefined();
        expect(target.message).toBe(message);
        expect(target.errorCode).toBe(errorCode);
    });
});