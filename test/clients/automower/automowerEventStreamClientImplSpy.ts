import { AutomowerEventStreamClientImpl, ConnectedEvent, ErrorEvent } from '../../../src/clients/automower/automowerEventStreamClient';
import { AccessToken } from '../../../src/model';
import { WebSocketWrapper } from '../../../src/primitives/webSocketWrapper';

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