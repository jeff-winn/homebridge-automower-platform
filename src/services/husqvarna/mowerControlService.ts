/**
 * Identifies a service which supports pause operations.
 */
export interface SupportsPauseControl {
    /**
     * Pauses the mower indefinitely.
     * @param mowerId The mower id.
     */
    pause(mowerId: string): Promise<void>;
}

/**
 * Identifies if the object implements {@link SupportsPauseControl}.
 * @param object The object to test.
 * @returns true if the object is {@link SupportsPauseControl}.
 */
export function supportsPause(object: unknown): object is SupportsPauseControl {
    return (<SupportsPauseControl>object).pause !== undefined;
}

/**
 * A service which can issue commands to a Husqvarna mower.
 */
export interface MowerControlService {   
    /**
     * Resume the mower.
     * @param mowerId The mower id.
     */
    resumeAsync(mowerId: string): Promise<void>;
    
    /**
     * Parks the mower.
     * @param mowerId The mower id.
     */
    park(mowerId: string): Promise<void>;
}