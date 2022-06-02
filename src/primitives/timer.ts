/**
 * Identifies a timer to execute a callback.
 */
export interface Timer {
    /**
     * Starts the timer.
     * @param callback The callback to execute.
     * @param delay The delay (in milliseconds) to wait prior to executing the callback.
     */
    start(callback: () => void, delay?: number | undefined): void;

    /**
     * Stops the timer.
     */
    stop(): void;
}

export class TimerImpl implements Timer {
    private timeoutId?: NodeJS.Timeout;

    public start(callback: () => void, delay?: number): void {
        this.timeoutId = setTimeout(callback, delay);
    }

    public stop(): void {
        if (this.timeoutId === undefined) {
            return;
        }

        clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
    }
}
