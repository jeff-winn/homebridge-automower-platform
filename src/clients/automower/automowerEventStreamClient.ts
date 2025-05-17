import { PlatformLogger } from '../../diagnostics/platformLogger';
import { AccessToken } from '../../model';
import { WebSocketWrapper } from '../../primitives/webSocketWrapper';
import { AbstractEventStreamClient, EventStreamClient } from '../eventStreamClient';
import { Battery, Calendar, CuttingHeight, Headlight, Message, MowerState, Planner, Position } from './automowerClient';

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
    /**
     * An undefined event type.
     */
    UNDEFINED = '',
    
    /**
    * Occurs when the battery percent is updated. 
    */
    BATTERY = 'battery-event-v2',

    /**
     * Occurs when the cutting height is updated.
     */
    CUTTING_HEIGHT = 'cuttingHeight-event-v2',

    /**
     * Occurs when the headlight mode is updated.
     */
    HEADLIGHTS = 'headlights-event-v2',

    /**
     * Occurs when a new message is added.
     */
    MESSAGE = 'message-event-v2',

    /**
     * Occurs when the mower status is updated.
     */
    MOWER = 'mower-event-v2',

    /**
     * Occurs when the planner is updated.
     */
    PLANNER = 'planner-event-v2',

    /**
     * Occurs when a new position is added.
     */
    POSITION = 'position-event-v2',

    /**
     * Occurs when the calendar is updated or a new task is added.
     */
    CALENDAR = 'calendar-event-v2'    
}

/**
 * Describes a battery event.
 */
export interface BatteryEvent extends AutomowerEvent {
    attributes: {
        battery: Battery;
    }
}

/**
 * Describes a calendar event.
 */
export interface CalendarEvent extends AutomowerEvent {
    attributes: {
        calendar: Calendar;
    }
}

/**
 * Describes a cutting height event.
 */
export interface CuttingHeightEvent extends AutomowerEvent {
    attributes: {
        cuttingHeight: CuttingHeight;
    }   
}

/**
 * Describes a headlights event.
 */
export interface HeadlightsEvent extends AutomowerEvent {
    attributes: {
        headlight: Headlight;
    }
}

/**
 * Describes a message event.
 */
export interface MessageEvent extends AutomowerEvent {
    attributes: {
        message: Message;
    }
}

/**
 * Describes a mower event.
 */
export interface MowerEvent extends AutomowerEvent {
    attributes: {
        mower: MowerState;
    }
}

/**
 * Describes a planner event.
 */
export interface PlannerEvent extends AutomowerEvent {
    attributes: {
        planner: Planner;
    }
}

/**
 * Describes a position event.
 */
export interface PositionEvent extends AutomowerEvent {
    attributes: {
        position: Position;
    }
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
    
    public constructor(private readonly baseUrl: string, readonly log: PlatformLogger) { 
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