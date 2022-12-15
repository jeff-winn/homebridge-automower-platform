import { Formats, Perms } from 'hap-nodejs';
import { CuttingHeight } from '../../../../src/services/homebridge/characteristics/cuttingHeight';

describe('CuttingHeight', () => {
    it('should initialize a new instance', () => {
        const result = new CuttingHeight();

        expect(result.displayName).toBe('Cutting Height');
        expect(result.UUID).toBe('536aa050-a419-4577-862e-d19a62bb04e1');
        
        expect(result.props.format).toBe(Formats.UINT8);
        expect(result.props.perms).toContain(Perms.PAIRED_READ);
        expect(result.props.perms).toContain(Perms.PAIRED_WRITE);
        expect(result.props.perms).toContain(Perms.NOTIFY);
        expect(result.props.minStep).toBe(1);
        expect(result.props.minValue).toBe(1);
        expect(result.props.maxValue).toBe(9);
    });
});