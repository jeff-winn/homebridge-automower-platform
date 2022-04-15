import { NotAuthorizedError } from '../../src/clients/notAuthorizedError';

describe('bad credentials error', () => {
    it('should create an instance', () => {
        const target = new NotAuthorizedError('Ouch');

        expect(target).toBeDefined();
        expect(target.message).toBe('Ouch');
    });
});