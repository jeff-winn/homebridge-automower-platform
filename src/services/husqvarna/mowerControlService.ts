/**
 * A service which can issue commands to a Husqvarna mower.
 */
export interface MowerControlService {
    /**
     * Pauses the mower indefinitely.
     * @param mowerId The mower id.
     */
    pause(mowerId: string): Promise<void>;

    /**
     * Resume the mower, according to the schedule.
     * @param mowerId The mower id.
     */
    resumeSchedule(mowerId: string): Promise<void>;
    
    /**
     * Parks the mower until further notice, which overrides the schedule.
     * @param mowerId The mower id.
     */
    parkUntilFurtherNotice(mowerId: string): Promise<void>;
}