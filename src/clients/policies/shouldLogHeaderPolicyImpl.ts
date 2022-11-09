import { ShouldLogHeaderPolicy } from '../fetchClient';

export class ShouldLogHeaderPolicyImpl implements ShouldLogHeaderPolicy {
    /**
     * Defines the list of header names which will be ignored by default.
     */
    private readonly IGNORE_HEADER_NAMES: string[] = [ 
        'authorization', 
        'x-api-key' 
    ];

    public shouldLog(name: string): boolean {
        return !this.IGNORE_HEADER_NAMES.includes(name.toLowerCase());
    }
}