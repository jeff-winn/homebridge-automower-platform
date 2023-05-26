import { PlatformLogger } from '../../diagnostics/platformLogger';
import { AccessToken } from '../../model';
import { WebSocketWrapper } from '../../primitives/webSocketWrapper';
import { AbstractEventStreamClient, EventStreamClient } from '../eventStreamClient';
import { Battery, Calendar, Headlight, MowerMetadata, MowerState, Planner, Position } from './automowerClient';

/**
 * Describes a connected event.
 */
export interface ConnectedEvent {
    connectionId: string;
    ready: boolean;
}

/**
 * Describes an automower event.
 */
export interface AutomowerEvent {
    id: string;
    type: AutomowerEventTypes;
}

/**
 * Describes the automower event types.
 */
export enum AutomowerEventTypes {
    UNKNOWN = 'unknown-event',
    STATUS = 'status-event',
    POSITIONS = 'positions-event',
    SETTINGS = 'settings-event'
}

/**
 * Describes a status event.
 */
export interface StatusEvent extends AutomowerEvent {
    attributes: {
        battery: Battery;
        mower: MowerState;
        planner: Planner;
        metadata: MowerMetadata;
    };
}

/**
 * Describes a positions event.
 */
export interface PositionsEvent extends AutomowerEvent {
    attributes: {
        positions: Position[];
    };
}

/**
 * Describes a settings event.
 * <p>
 * This event occurs when the settings have been modified on a mower.
 */
export interface SettingsEvent extends AutomowerEvent {
    attributes: {
        calendar?: Calendar;
        cuttingHeight?: number;
        headlight?: Headlight;
    };
}

/**
 * Describes an error event.
 */
export interface ErrorEvent {
    error: string;
    message: string;
    type: string;
}

/**
 * A client which receives a stream of events for all mowers connected to the account.
 */
export interface AutomowerEventStreamClient extends EventStreamClient {
    /**
     * Sets the callback to execute when an event is received.
     * @param callback The callback to execute.
     */
    setOnEventCallback(callback: (event: AutomowerEvent) => Promise<void>): void;
}

export class AutomowerEventStreamClientImpl extends AbstractEventStreamClient implements AutomowerEventStreamClient {
    private messageReceivedCallback?: (payload: AutomowerEvent) => Promise<void>;
    private connectionId?: string;
    
    public constructor(private baseUrl: string, log: PlatformLogger) { 
        super(log);
    }

    protected createSocket(token: AccessToken): Promise<WebSocketWrapper> {
        const socket = this.createSocketCore(this.baseUrl, token);

        socket.on('message', this.onMessageReceivedCallback.bind(this));
        socket.on('error', this.onErrorReceivedCallback.bind(this));
        socket.on('close', this.onCloseReceivedCallback.bind(this));

        return Promise.resolve(socket);
    }

    public getConnectionId(): string | undefined {
        return this.connectionId;
    }

    protected setConnectionId(value: string | undefined) {
        this.connectionId = value;
    }    

    public isCallbackSet(): boolean {
        return this.messageReceivedCallback !== undefined;
    }

    protected onErrorReceivedCallback(err: ErrorEvent): void {
        this.onErrorReceivedCallbackAsync(err).then()
            .catch(e => {
                this.log.error('ERROR_HANDLING_ERROR_EVENT', e);
            });
    }
    
    private async onErrorReceivedCallbackAsync(err: ErrorEvent): Promise<void> {
        this.log.error('UNEXPECTED_SOCKET_ERROR', {
            error: err.error,
            message: err.message,
            type: err.type
        });

        await this.notifyErrorReceivedAsync();
    }

    protected onMessageReceivedCallback(buffer: Buffer): void {
        this.onMessageReceivedCallbackAsync(buffer).then()
            .catch(err => {
                this.log.error('ERROR_PROCESSING_MESSAGE', err);
            });
    }

    private async onMessageReceivedCallbackAsync(buffer: Buffer): Promise<void> {
        if (buffer.length === 0) {
            return;
        }

        const data = JSON.parse(buffer.toString());
        this.log.debug('RECEIVED_EVENT', JSON.stringify(data));

        const connectedEvent = data as ConnectedEvent;
        if (connectedEvent.connectionId !== undefined) {
            await this.onConnectedReceivedAsync(connectedEvent);
        } else {
            const mowerEvent = data as AutomowerEvent;
            if (mowerEvent.type !== undefined) {
                await this.notifyEventReceivedAsync(mowerEvent);
            }
        }
    }

    protected async onConnectedReceivedAsync(event: ConnectedEvent): Promise<void> {
        this.setConnectionId(event.connectionId);
        await this.onConnectedAsync();
    }

    protected async notifyEventReceivedAsync(event: AutomowerEvent): Promise<void> {
        if (this.messageReceivedCallback !== undefined) {
            await this.messageReceivedCallback(event);
        }
    }

    public setOnEventCallback(callback: (event: AutomowerEvent) => Promise<void>): void {        
        this.messageReceivedCallback = callback;
    }
}