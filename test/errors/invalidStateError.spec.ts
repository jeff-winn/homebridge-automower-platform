import { InvalidStateError } from '../../src/errors/invalidStateError';

describe('InvalidStateError', () => {
    it('should create an instance', () => {
        const message = 'Ouch';

        const target = new InvalidStateError(message);

        expect(target).toBeDefined();
        expect(target.message).toBe(message);
    });
});