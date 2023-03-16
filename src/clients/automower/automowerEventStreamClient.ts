import { PlatformLogger } from '../../diagnostics/platformLogger';
import { AccessToken } from '../../model';
import { WebSocketWrapper, WebSocketWrapperImpl } from '../../primitives/webSocketWrapper';
import { PLUGIN_ID } from '../../settings';
import { EventStreamClient } from '../eventStreamClient';
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
     * Executes the callback when an event is received.
     * @param callback The callback to execute.
     */
    on(callback: (event: AutomowerEvent) => Promise<void>): void;
}

export class AutomowerEventStreamClientImpl implements AutomowerEventStreamClient {
    private socket?: WebSocketWrapper;
    private onMessageReceivedCallback?: (payload: AutomowerEvent) => void;

    private onErrorReceivedCallback?: () => void;
    private onConnectedCallback?: () => void;
    private onDisconnectedCallback?: () => void;

    private connecting = false;
    private connected = false;
    private connectionId?: string;
    
    public constructor(private baseUrl: string, private log: PlatformLogger) { }
    
    public open(token: AccessToken): void {
        if (this.socket !== undefined) {
            this.socket.close();
        }

        this.onConnecting();        
        this.socket = this.createSocket(token);
        
        this.socket.on('message', this.onSocketMessageReceived.bind(this));
        this.socket.on('error', this.onErrorReceived.bind(this));    
        this.socket.on('close', this.onCloseReceived.bind(this));
    }

    protected onConnecting(): void {
        this.setConnecting(true);
    }

    protected createSocket(token: AccessToken): WebSocketWrapper {
        return new WebSocketWrapperImpl(this.baseUrl, {
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'X-Application-Id': PLUGIN_ID
            }
        });
    }

    public getConnectionId(): string | undefined {
        return this.connectionId;
    }

    protected setConnectionId(value: string | undefined) {
        this.connectionId = value;
    }

    public ping(): void {
        this.socket?.ping('ping');
    }

    public isConnected(): boolean {
        return this.connected;
    }

    protected setConnected(value: boolean): void {
        this.connected = value;
    }

    public isConnecting(): boolean {
        return this.connecting;
    }

    protected setConnecting(value: boolean): void {
        this.connecting = value;
    }

    public isCallbackSet(): boolean {
        return this.onMessageReceivedCallback !== undefined;
    }

    protected onCloseReceived() {
        if (this.isConnected()) {
            this.setConnected(false);

            if (this.onDisconnectedCallback !== undefined) {
                try {
                    this.onDisconnectedCallback();                
                } catch (e) {
                    this.log.error('ERROR_HANDLING_DISCONNECTED_EVENT', e);
                }
            }
        } else if (this.connecting) {
            this.setConnecting(false);
        }        
    }
    
    protected onErrorReceived(err: ErrorEvent): void {
        this.log.error('UNEXPECTED_SOCKET_ERROR', {
            error: err.error,
            message: err.message,
            type: err.type
        });

        if (this.onErrorReceivedCallback !== undefined) {
            try {
                this.onErrorReceivedCallback();
            } catch (e) {
                this.log.error('ERROR_HANDLING_ERROR_EVENT', e);
            }
        }
    }

    protected onSocketMessageReceived(buffer: Buffer): void {
        if (buffer.length === 0) {
            return;
        }

        try {
            const data = JSON.parse(buffer.toString());
            this.log.debug('RECEIVED_EVENT', JSON.stringify(data));
    
            const connectedEvent = data as ConnectedEvent;
            if (connectedEvent.connectionId !== undefined) {
                this.onConnectedReceived(connectedEvent);
            } else {
                const mowerEvent = data as AutomowerEvent;
                if (mowerEvent.type !== undefined) {
                    this.onMessageReceived(mowerEvent);
                }
            }
        } catch (e) {
            this.log.error('ERROR_PROCESSING_MESSAGE', e);
        }
    }

    protected onConnectedReceived(event: ConnectedEvent): void {
        this.setConnectionId(event.connectionId);
        this.setConnecting(false);
        this.setConnected(true);
        
        if (this.onConnectedCallback !== undefined) {
            try {
                this.onConnectedCallback();
            } catch (e) {
                this.log.error('ERROR_HANDLING_CONNECTED_EVENT', e);
            }
        }
    }

    protected onMessageReceived(event: AutomowerEvent): void {
        if (this.onMessageReceivedCallback === undefined) {
            return;
        }

        this.onMessageReceivedCallback(event);
    }

    public close(): void {
        if (this.socket === undefined) {
            return;
        }

        this.socket.terminate();
    }

    public on(callback: (event: AutomowerEvent) => Promise<void>): void {        
        this.onMessageReceivedCallback = callback;
    }

    public onConnected(callback: () => Promise<void>): void {
        this.onConnectedCallback = callback;
    }

    public onDisconnected(callback: () => Promise<void>): void {
        this.onDisconnectedCallback = callback;
    }

    public onError(callback: () => Promise<void>): void {
        this.onErrorReceivedCallback = callback;
    }
}