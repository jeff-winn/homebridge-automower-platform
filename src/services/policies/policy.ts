/**
 * Identifies a policy.
 */
export interface Policy {
    /**
     * Check the policy.
     */
    check(): boolean;     
}

/**
 * Identifies a policy which should be optionally applied.
 */
export interface OptionalPolicy extends Policy {
    /**
     * Identifies whether the policy should be applied.
     */
    shouldApply(): boolean;     
}