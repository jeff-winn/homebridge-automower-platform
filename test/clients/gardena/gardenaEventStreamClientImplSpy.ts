import { Error } from '../../../src/clients/gardena/gardenaClient';
import { GardenaEventStreamClientImpl } from '../../../src/clients/gardena/gardenaEventStreamClient';
import { AccessToken } from '../../../src/model';
import { WebSocketWrapper } from '../../../src/primitives/webSocketWrapper';

export class GardenaEventStreamClientImplSpy extends GardenaEventStreamClientImpl {
    public callback?: (token: AccessToken) => WebSocketWrapper;

    protected createSocketCore(url: string, token: AccessToken): WebSocketWrapper {
        return this.callback!(token);
    }

    public unsafeOnMessageReceivedCallback(buffer: Buffer): void {
        return this.onMessageReceivedCallback(buffer);
    }

    public unsafeOnFirstMessageReceivedAsync(): Promise<void> {
        return this.onFirstMessageReceivedAsync();
    }

    public unsafeOnCloseReceivedAsync(): Promise<void> {
        return this.onCloseReceivedAsync();
    }

    public unsafeOnErrorReceivedCallback(err: Error): void {
        this.onErrorReceivedCallback(err);
    }

    public unsafeOnConnecting(): void {
        this.onConnecting();
    }   

    public unsafeSetConnecting(value: boolean): void {
        this.setConnecting(value);
    }

    public unsafeSetConnected(value: boolean): void {
        this.setConnected(value);
    }
}