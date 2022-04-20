import { AutomowerEventStream } from '../../../src/clients/automowerEventStream';
import { AutomowerEvent } from '../../../src/clients/events';
import { OAuthToken } from '../../../src/clients/model';

export class AutomowerEventStreamSpy implements AutomowerEventStream {
    opened = false;
    closed = false;
    callbackSet = false;
    keptAlive = false;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    open(token: OAuthToken): void {
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