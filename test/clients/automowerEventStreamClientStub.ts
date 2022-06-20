/* eslint-disable @typescript-eslint/no-unused-vars */
import { AutomowerEventStreamClient } from '../../src/clients/automowerEventStreamClient';
import { AutomowerEvent, ConnectedEvent, ErrorEvent } from '../../src/events';
import { AccessToken } from '../../src/model';

export class AutomowerEventStreamClientStub implements AutomowerEventStreamClient {   
    public opened = false;
    public closed = false;
    public callbackSet = false;
    public disconnectedCallbackSet = false;
    public connectedCallbackSet = false;
    public errorCallbackSet = false;
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

    public on(callback: (event: AutomowerEvent) => Promise<void>): void {
        this.callbackSet = true;
    }

    public onDisconnected(callback: () => Promise<void>): void {
        this.disconnectedCallbackSet = true;
    }

    public onConnected(callback: (event: ConnectedEvent) => Promise<void>): void {
        this.connectedCallbackSet = true;
    }

    public onError(callback: (event: ErrorEvent) => Promise<void>): void {
        this.errorCallbackSet = true;
    }
}