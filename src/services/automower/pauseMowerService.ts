/**
 * A service which causes the mower to pause immediately wherever it is at within the mowing area.
 */
export interface PauseMowerService {
    /**
     * Pauses the mower immediately.
     * @param id The id of the mower to pause.
     */
    pauseMower(id: string): Promise<void>;
}