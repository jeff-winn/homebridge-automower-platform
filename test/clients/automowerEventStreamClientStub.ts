import { AutomowerEventStreamClient } from '../../src/clients/automowerEventStreamClient';
import { AutomowerEvent } from '../../src/events';
import { AccessToken } from '../../src/model';

export class AutomowerEventStreamClientStub implements AutomowerEventStreamClient {
    public opened = false;
    public closed = false;
    public callbackSet = false;
    public keptAlive = false;

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
    public on(callback: (event: AutomowerEvent) => Promise<void>): void {
        this.callbackSet = true;
    }
}