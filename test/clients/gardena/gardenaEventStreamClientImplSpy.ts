import { GardenaEventStreamClientImpl } from '../../../src/clients/gardena/gardenaEventStreamClient';
import { AccessToken } from '../../../src/model';
import { WebSocketWrapper } from '../../../src/primitives/webSocketWrapper';

export class GardenaEventStreamClientImplSpy extends GardenaEventStreamClientImpl {
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