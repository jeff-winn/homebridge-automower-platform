import { BadCredentialsError} from '../../src/errors/badCredentialsError';

describe('bad credentials error', () => {
    it('should create an instance', () => {
        const target = new BadCredentialsError('Ouch');

        expect(target).toBeDefined();
        expect(target.message).toBe('Ouch');
    });
});