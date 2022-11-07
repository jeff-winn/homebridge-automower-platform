import { AccountLockedError } from '../../src/errors/accountLockedError';

describe('AccountLockedError', () => {
    it('should create an instance', () => {
        const errorCode = 'ERR0000';
        const message = 'Ouch';

        const target = new AccountLockedError(message, errorCode);

        expect(target).toBeDefined();
        expect(target.message).toBe(message);
        expect(target.errorCode).toBe(errorCode);
    });
});