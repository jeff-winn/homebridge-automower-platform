import { BadCredentialsError } from '../../src/errors/badCredentialsError';

describe('BadCredentialsError', () => {
    it('should create an instance', () => {
        const target = new BadCredentialsError('Ouch');

        expect(target).toBeDefined();
        expect(target.message).toBe('Ouch');
    });
});