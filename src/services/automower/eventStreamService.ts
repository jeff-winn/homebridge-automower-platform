import { AccessTokenManager } from './accessTokenManager';
import { AutomowerEventStreamClient } from '../../clients/automowerEventStreamClient';
import { AutomowerEvent, AutomowerEventTypes, SettingsEvent, StatusEvent } from '../../events';
import { Timer } from '../../primitives/timer';
import { PlatformLogger } from '../../diagnostics/platformLogger';

/**
 * A mechanism which is capable of streaming events for the Husqvarna account.
 */
export interface EventStreamService {
    /**
     * Occurs when a {@link StatusEvent} has been received.
     * @param callback The callback to execute.
     */
    onStatusEventReceived(callback: (event: StatusEvent) => Promise<void>): void;
    
    /**
     * Occurs when a {@link SettingsEvent} has been received.
     * @param callback The callback to execute.
     */
    onSettingsEventReceived(callback: (event: SettingsEvent) => Promise<void>): void;

    /**
     * Starts streaming events.
     */
    start(): Promise<void>;
    
    /**
     * Stops streaming events.
     */
    stop(): Promise<void>;
}

export class EventStreamServiceImpl implements EventStreamService {
    private readonly KEEP_ALIVE_INTERVAL = 60000; // One minute
    private readonly RECONNECT_INTERVAL = 3600000; // One hour

    private onStatusEventCallback?: (event: StatusEvent) => Promise<void>;
    private onSettingsEventCallback?: (event: SettingsEvent) => Promise<void>;
    private started?: Date;
    private lastEventReceived?: Date;
    private attached = false;

    public constructor(private tokenManager: AccessTokenManager, private stream: AutomowerEventStreamClient, 
        private log: PlatformLogger, private timer: Timer) { }


    public onSettingsEventReceived(callback: (event: SettingsEvent) => Promise<void>): void {
        this.onSettingsEventCallback = callback;        
    }

    public onStatusEventReceived(callback: (event: StatusEvent) => Promise<void>): void {
        this.onStatusEventCallback = callback;        
    }

    public async start(): Promise<void> {
        if (!this.attached) {
            this.stream.on(this.onEventReceived.bind(this));
            this.attached = true;
        }

        await this.connect();
        this.startKeepAlive();

        this.setStarted(new Date());
    }

    protected setStarted(value?: Date): void {
        this.started = value;
    }

    private async connect(): Promise<void> {
        const token = await this.tokenManager.getCurrentToken();
        this.stream.open(token);
    }

    public getReconnectInterval(): number {
        return this.RECONNECT_INTERVAL;
    }

    private startKeepAlive() {
        this.timer.start(this.keepAlive.bind(this), this.KEEP_ALIVE_INTERVAL);
    }
    
    protected async keepAlive(): Promise<void> {
        try {           
            if (this.shouldReconnect()) {
                await this.reconnect();
            } else {
                this.pingOnce();
            }
        } finally {
            // Restart the timer.
            this.startKeepAlive();
        }
    }    

    protected shouldReconnect(): boolean {
        if (!this.stream.isConnected()) {
            // The client somehow got disconnected, just attempt to reconnect.
            return true;
        }

        const now = new Date();
        
        if (this.lastEventReceived === undefined && this.started !== undefined && 
            ((now.getTime() - this.started.getTime()) > this.getReconnectInterval())) {
            // No message has been received, and the client was started an hour ago.
            return true;
        }

        if (this.lastEventReceived !== undefined && 
            ((now.getTime() - this.lastEventReceived.getTime()) > this.getReconnectInterval())) {
            // A message has not been received within the last hour.
            return true;
        }

        return false;
    }

    protected async reconnect(): Promise<void> {
        this.disconnect();
        await this.connect();

        this.setStarted(new Date());
    }

    protected pingOnce(): void {
        this.stream.ping();
    }

    public stop(): Promise<void> {
        this.disconnect();
        this.stopKeepAlive();

        return Promise.resolve(undefined);
    }

    protected disconnect(): void {
        this.stream.close();
    }
    
    protected stopKeepAlive(): void {
        this.timer.stop();
    }

    protected setLastEventReceived(value?: Date): void {
        this.lastEventReceived = value;
    }

    protected onEventReceived(event: AutomowerEvent): Promise<void> {
        this.setLastEventReceived(new Date());

        switch (event.type) {
        case AutomowerEventTypes.POSITIONS:
            return Promise.resolve(undefined);

        case AutomowerEventTypes.SETTINGS:
            return this.onSettingsEvent(event as SettingsEvent);

        case AutomowerEventTypes.STATUS:
            return this.onStatusEvent(event as StatusEvent);        

        default:
            this.log.warn(`Received unknown event: ${event.type}`);
            return Promise.resolve(undefined);
        }
    }

    protected onSettingsEvent(event: SettingsEvent): Promise<void> {
        if (this.onSettingsEventCallback === undefined) {
            return Promise.resolve(undefined);
        }

        return this.onSettingsEventCallback(event);
    }

    protected onStatusEvent(event: StatusEvent): Promise<void> {
        if (this.onStatusEventCallback === undefined) {
            return Promise.resolve(undefined);
        }

        return this.onStatusEventCallback(event);
    }
}