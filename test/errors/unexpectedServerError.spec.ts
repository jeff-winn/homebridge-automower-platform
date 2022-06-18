import { UnexpectedServerError } from '../../src/errors/unexpectedServerError';

describe('UnexpectedServerError', () => {
    it('should create an instance', () => {
        const message = 'Ouch';
        const errorCode = 'ERR0000';

        const target = new UnexpectedServerError(message, errorCode);

        expect(target).toBeDefined();
        expect(target.message).toBe(message);
        expect(target.errorCode).toBe(errorCode);
    });
});