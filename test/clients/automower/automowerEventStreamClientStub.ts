/* eslint-disable @typescript-eslint/no-unused-vars */
import { AutomowerEvent, AutomowerEventStreamClient, ConnectedEvent, ErrorEvent } from '../../../src/clients/automower/automowerEventStreamClient';
import { AccessToken } from '../../../src/model';

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
    public open(token: AccessToken): Promise<void> {
        this.opened = true;
        return Promise.resolve(undefined);
    }

    public close(): Promise<void> {
        this.closed = true;
        return Promise.resolve(undefined);
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