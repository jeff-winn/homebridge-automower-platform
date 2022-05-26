import { UnexpectedServerError } from '../../src/errors/unexpectedServerError';

describe('UnexpectedServerError', () => {
    it('should create an instance', () => {
        const target = new UnexpectedServerError('Ouch');

        expect(target).toBeDefined();
        expect(target.message).toBe('Ouch');
    });
});