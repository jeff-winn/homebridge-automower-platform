import { AutomowerEventStreamClientImpl } from '../../src/clients/automowerEventStreamClient';
import { WebSocketWrapper, ErrorEvent } from '../../src/clients/primitives/webSocketWrapper';
import { ConnectedEvent } from '../../src/events';
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

    public unsafeOnConnected(event: ConnectedEvent): void {
        this.onConnected(event);
    }
}