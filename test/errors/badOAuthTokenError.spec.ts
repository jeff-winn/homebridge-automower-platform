import { BadCredentialsError } from '../../src/errors/badCredentialsError';
import { BadOAuthTokenError } from '../../src/errors/badOAuthTokenError';

describe('BadOAuthTokenError', () => {
    it('should create an instance', () => {
        const message = 'Ouch';
        const errorCode = 'ERR0000';

        const target = new BadOAuthTokenError(message, errorCode);

        expect(target).toBeDefined();
        expect(target.message).toBe(message);
        expect(target.errorCode).toBe(errorCode);
    });

    it('should subclass the BadCredentialsError class', () => {
        const target = new BadOAuthTokenError('Ouch', 'ERR0000');

        expect(target instanceof BadCredentialsError).toBeTruthy();
    });
});