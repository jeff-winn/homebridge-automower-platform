import { AutomowerEventStreamClientImpl } from '../../src/clients/automowerEventStreamClient';
import { WebSocketWrapper } from '../../src/clients/primitives/webSocketWrapper';
import { ConnectedEvent, ErrorEvent } from '../../src/events';
import { AccessToken } from '../../src/model';

export class AutomowerEventStreamClientImplSpy extends AutomowerEventStreamClientImpl {
    public callback?: (token: AccessToken) => WebSocketWrapper;

    protected override createSocket(token: AccessToken): WebSocketWrapper {
        return this.callback!(token);
    }

    public unsafeOnSocketMessageReceived(buffer: Buffer): void {
        this.onSocketMessageReceived(buffer);
    }

    public unsafeOnCloseReceived(): void {
        this.onCloseReceived();
    }

    public unsafeOnErrorReceived(err: ErrorEvent): void {
        this.onErrorReceived(err);
    }

    public unsafeOnConnecting(): void {
        this.onConnecting();
    }

    public unsafeOnConnectedReceived(event: ConnectedEvent): void {
        this.onConnectedReceived(event);
    }

    public unsafeSetConnecting(value: boolean): void {
        this.setConnecting(value);
    }

    public unsafeSetConnected(value: boolean): void {
        this.setConnected(value);
    }
}