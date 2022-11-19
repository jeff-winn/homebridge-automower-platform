import { SimultaneousLoginError } from '../../src/errors/simultaneousLoginError';

describe('SimultaneousLoginError', () => {
    it('should create an instance', () => {
        const errorCode = 'ERR0000';
        const message = 'Ouch';

        const target = new SimultaneousLoginError(message, errorCode);

        expect(target).toBeDefined();
        expect(target.message).toBe(message);
        expect(target.errorCode).toBe(errorCode);
    });
});