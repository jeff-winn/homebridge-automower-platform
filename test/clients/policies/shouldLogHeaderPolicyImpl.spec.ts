import { ShouldLogHeaderPolicyImpl } from '../../../src/clients/policies/shouldLogHeaderPolicyImpl';

describe('ShouldLogHeaderPolicyImpl', () => {
    let target: ShouldLogHeaderPolicyImpl;

    beforeEach(() => {
        target = new ShouldLogHeaderPolicyImpl();
    });

    it('should return true for other headers', () => {
        expect(target.shouldLog('other')).toBeTruthy();
    });

    it('should return false for authorization header', () => {
        expect(target.shouldLog('authorization')).toBeFalsy();
    });
    
    it('should return false for authorization header if upper case', () => {
        expect(target.shouldLog('AUTHORIZATION')).toBeFalsy();
    });

    it('should return false for x-api-key header', () => {
        expect(target.shouldLog('x-api-key')).toBeFalsy();
    });

    it('should return false for x-api-key header if upper case', () => {
        expect(target.shouldLog('X-API-KEY')).toBeFalsy();
    });
});