import { AutomowerEventStreamClient } from '../../src/clients/automowerEventStreamClient';
import { AutomowerEvent } from '../../src/events';
import { AccessToken } from '../../src/model';

export class AutomowerEventStreamClientSpy implements AutomowerEventStreamClient {
    opened = false;
    closed = false;
    callbackSet = false;
    keptAlive = false;

    public isConnected(): boolean {
        return this.opened;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public open(token: AccessToken): void {
        this.opened = true;
    }

    public close(): void {
        this.closed = true;
    }

    public ping(): void {
        this.keptAlive = true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    on(callback: (event: AutomowerEvent) => Promise<void>): void {
        this.callbackSet = true;
    }
}