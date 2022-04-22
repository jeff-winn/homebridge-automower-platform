import { AutomowerEventStreamClient } from '../../src/clients/automowerEventStreamClient';
import { AutomowerEvent } from '../../src/clients/events';
import { AccessToken } from '../../src/clients/model';

export class AutomowerEventStreamClientSpy implements AutomowerEventStreamClient {
    opened = false;
    closed = false;
    callbackSet = false;
    keptAlive = false;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    open(token: AccessToken): void {
        this.opened = true;
    }

    close(): void {
        this.closed = true;
    }

    ping(): void {
        this.keptAlive = true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    on(callback: (event: AutomowerEvent) => Promise<void>): void {
        this.callbackSet = true;
    }
}