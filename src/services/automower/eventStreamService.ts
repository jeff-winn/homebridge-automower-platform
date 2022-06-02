import { AccessTokenManager } from './accessTokenManager';
import { AutomowerEventStreamClient } from '../../clients/automowerEventStreamClient';
import { AutomowerEvent, AutomowerEventTypes, PositionsEvent, SettingsEvent, StatusEvent } from '../../events';
import { Timer } from '../../primitives/timer';
import { PlatformLogger } from '../../diagnostics/platformLogger';
import { BadCredentialsError } from '../../errors/badCredentialsError';

/**
 * A mechanism which is capable of streaming events for the Husqvarna account.
 */
export interface EventStreamService {
    /**
     * Occurs when a {@link PositionsEvent} has been received.
     * @param callback The callback to execute.
     */
    onPositionsEventReceived(callback: (event: PositionsEvent) => Promise<void>): void;

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
    private onPositionsEventCallback?: (event: PositionsEvent) => Promise<void>;

    private started?: Date;
    private lastEventReceived?: Date;
    private attached = false;

    public constructor(private tokenManager: AccessTokenManager, private stream: AutomowerEventStreamClient, 
        private log: PlatformLogger, private timer: Timer) { }


    public onPositionsEventReceived(callback: (event: PositionsEvent) => Promise<void>): void {
        this.onPositionsEventCallback = callback;        
    }

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
        this.log.debug('Attempting to open a connection to the stream...');

        try {
            const token = await this.tokenManager.getCurrentToken();
            this.stream.open(token);

            this.log.debug('Stream connection opened successfully.');
        } catch (e) {
            if (e instanceof BadCredentialsError) {
                this.tokenManager.flagAsInvalid();
            }
            
            throw e;
        }
    }

    public getReconnectInterval(): number {
        return this.RECONNECT_INTERVAL;
    }

    private startKeepAlive() {
        this.timer.start(this.keepAlive.bind(this), this.KEEP_ALIVE_INTERVAL);
    }
    
    protected async keepAlive(): Promise<void> {
        this.log.debug('Checking keep alive for the client stream...');

        try {        
            if (this.shouldReconnect()) {
                await this.reconnect();
            } else {
                this.pingOnce();
            }

            this.log.debug('Completed keep alive successfully.');
        } catch (e) {
            this.log.error('An unexpected error occurred while keeping the client stream alive.', e);
        } finally {
            // Restart the timer.
            this.startKeepAlive();
        }
    }    

    protected shouldReconnect(): boolean {
        this.log.debug('Attempting to decide whether the event stream should be reconnected...');        
        let result = false;

        if (!this.stream.isConnected()) {
            this.log.debug('The stream somehow got disconnected; proceed with reconnect.');
            result = true;
        } else {
            const now = new Date();
            
            if (this.lastEventReceived === undefined && this.started !== undefined && 
                ((now.getTime() - this.started.getTime()) > this.getReconnectInterval())) {
                this.log.debug('No message has been received, and the client was started an hour ago; proceed with reconnect.');
                result = true;
            } else if (this.lastEventReceived !== undefined && 
                ((now.getTime() - this.lastEventReceived.getTime()) > this.getReconnectInterval())) {
                this.log.debug('A message has not been received within the last hour; proceed with reconnect.');
                result = true;
            }
        }

        return result;
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
        this.log.debug('Closing the stream...');

        this.stream.close();

        this.log.debug('Stream closed.');
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
            return this.onPositionsEvent(event as PositionsEvent);

        case AutomowerEventTypes.SETTINGS:
            return this.onSettingsEvent(event as SettingsEvent);

        case AutomowerEventTypes.STATUS:
            return this.onStatusEvent(event as StatusEvent);        

        default:
            this.log.warn(`Received unknown event: ${event.type}`);
            return Promise.resolve(undefined);
        }
    }

    protected onPositionsEvent(event: PositionsEvent): Promise<void> {
        if (this.onPositionsEventCallback === undefined) {
            return Promise.resolve(undefined);
        }

        return this.onPositionsEventCallback(event);
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