import { NotAuthorizedError } from '../../src/errors/notAuthorizedError';

describe('NotAuthorizedError', () => {
    it('should create an instance', () => {
        const message = 'Ouch';
        const errorCode = 'ERR0000';

        const target = new NotAuthorizedError(message, errorCode);

        expect(target).toBeDefined();
        expect(target.message).toBe(message);
        expect(target.errorCode).toBe(errorCode);
    });
});