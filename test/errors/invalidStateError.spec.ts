import { InvalidStateError } from '../../src/errors/invalidStateError';

describe('InvalidStateError', () => {
    it('should create an instance', () => {
        const target = new InvalidStateError('Ouch');

        expect(target).toBeDefined();
        expect(target.message).toBe('Ouch');
    });
});