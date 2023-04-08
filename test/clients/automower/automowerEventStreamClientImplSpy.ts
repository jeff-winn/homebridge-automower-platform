import { AutomowerEventStreamClientImpl, ConnectedEvent, ErrorEvent } from '../../../src/clients/automower/automowerEventStreamClient';
import { AccessToken } from '../../../src/model';
import { WebSocketWrapper } from '../../../src/primitives/webSocketWrapper';

export class AutomowerEventStreamClientImplSpy extends AutomowerEventStreamClientImpl {
    public callback?: (token: AccessToken) => WebSocketWrapper;

    protected createSocketCore(url: string, token: AccessToken): WebSocketWrapper {
        return this.callback!(token);
    }

    public unsafeOnMessageReceived(buffer: Buffer): Promise<void> {
        return this.onMessageReceived(buffer);
    }

    public unsafeOnCloseReceived(): Promise<void> {
        return this.onCloseReceived();
    }

    public unsafeOnErrorReceived(err: ErrorEvent): Promise<void> {
        return this.onErrorReceived(err);
    }

    public unsafeOnConnecting(): void {
        this.onConnecting();
    }

    public unsafeOnConnectedReceived(event: ConnectedEvent): Promise<void> {
        return this.onConnectedReceived(event);
    }

    public unsafeSetConnecting(value: boolean): void {
        this.setConnecting(value);
    }

    public unsafeSetConnected(value: boolean): void {
        this.setConnected(value);
    }
}