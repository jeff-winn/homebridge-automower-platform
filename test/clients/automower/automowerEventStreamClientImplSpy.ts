import { AutomowerEventStreamClientImpl, ConnectedEvent, ErrorEvent } from '../../../src/clients/automower/automowerEventStreamClient';
import { AccessToken } from '../../../src/model';
import { WebSocketWrapper } from '../../../src/primitives/webSocketWrapper';

export class AutomowerEventStreamClientImplSpy extends AutomowerEventStreamClientImpl {
    public callback?: (token: AccessToken) => WebSocketWrapper;

    protected createSocketCore(url: string, token: AccessToken): WebSocketWrapper {
        return this.callback!(token);
    }

    public unsafeOnMessageReceivedCallback(buffer: Buffer): void {
        this.onMessageReceivedCallback(buffer);
    }

    public unsafeOnCloseReceivedAsync(): Promise<void> {
        return this.onCloseReceivedAsync();
    }

    public unsafeOnErrorReceivedCallback(err: ErrorEvent): void {
        this.onErrorReceivedCallback(err);
    }

    public unsafeOnConnecting(): void {
        this.onConnecting();
    }

    public unsafeOnConnectedReceivedAsync(event: ConnectedEvent): Promise<void> {
        return this.onConnectedReceivedAsync(event);
    }

    public unsafeSetConnecting(value: boolean): void {
        this.setConnecting(value);
    }

    public unsafeSetConnected(value: boolean): void {
        this.setConnected(value);
    }
}