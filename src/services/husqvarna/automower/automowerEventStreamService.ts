import {
    AutomowerEvent, AutomowerEventStreamClient, AutomowerEventTypes, SettingsEvent, StatusEvent
} from '../../../clients/automower/automowerEventStreamClient';
import { PlatformLogger } from '../../../diagnostics/platformLogger';
import { Timer } from '../../../primitives/timer';
import { AccessTokenManager } from '../accessTokenManager';
import { AbstractEventStreamService } from '../eventStreamService';
import { AutomowerMowerScheduleConverter } from './converters/automowerMowerScheduleConverter';
import { AutomowerMowerStateConverter } from './converters/automowerMowerStateConverter';

export class AutomowerEventStreamService extends AbstractEventStreamService<AutomowerEventStreamClient> {
    private readonly lastStatusEvents = new Map<string, StatusEvent>();
    private readonly lastSettingsEvents = new Map<string, SettingsEvent>();

    public constructor(private readonly stateConverter: AutomowerMowerStateConverter, private readonly scheduleConverter: AutomowerMowerScheduleConverter,
        tokenManager: AccessTokenManager, stream: AutomowerEventStreamClient, log: PlatformLogger, timer: Timer) { 
        super(tokenManager, stream, log, timer);
    }

    protected override attachTo(stream: AutomowerEventStreamClient): void {
        stream.setOnEventCallback(this.onEventReceived.bind(this));

        super.attachTo(stream);
    }
    
    protected onEventReceived(event: AutomowerEvent): Promise<void> {
        this.setLastEventReceived(new Date());

        switch (event.type) {
            case AutomowerEventTypes.POSITIONS:
                return Promise.resolve(undefined); // Ignore the event.

            case AutomowerEventTypes.SETTINGS:
                return this.onSettingsEvent(event as SettingsEvent);

            case AutomowerEventTypes.STATUS:
                return this.onStatusEvent(event as StatusEvent);        

            default:
                this.log.warn('RECEIVED_UNKNOWN_EVENT', event.type);
                return Promise.resolve(undefined);
        }
    }

    protected async onSettingsEvent(event: SettingsEvent): Promise<void> {
        this.lastSettingsEvents[event.id] = event;

        if (event.attributes.cuttingHeight !== undefined) {
            await this.raiseMowerSettingsChangedEvent({
                mowerId: event.id,
                attributes: {
                    settings: {
                        cuttingHeight: event.attributes.cuttingHeight
                    }
                }
            });
        }

        await this.raiseMowerScheduleChangedEventIfNeeded(event.id);
    }

    protected async raiseMowerScheduleChangedEventIfNeeded(mowerId: string): Promise<void> {
        const lastSettingsEvent = this.lastSettingsEvents.get(mowerId);
        const lastStatusEvent = this.lastStatusEvents.get(mowerId);

        if (lastSettingsEvent === undefined || lastSettingsEvent.attributes.calendar === undefined || lastStatusEvent === undefined) {
            // Both pieces of data are required for the conversion.
            return;
        }

        await this.raiseMowerSettingsChangedEvent({
            mowerId: mowerId,
            attributes: {
                schedule: this.scheduleConverter.convertPlannerAndCalendar(lastStatusEvent.attributes.planner, lastSettingsEvent.attributes.calendar)
            }
        });
    }

    protected async onStatusEvent(event: StatusEvent): Promise<void> {    
        this.lastStatusEvents[event.id] = event;

        await this.raiseMowerStatusChangedEvent({
            mowerId: event.id,
            attributes: {
                battery: {
                    level: event.attributes.battery.batteryPercent
                },
                connection: {
                    connected: event.attributes.metadata.connected
                },
                mower: this.stateConverter.convertStatusAttributes(event.attributes)
            }
        });

        await this.raiseMowerScheduleChangedEventIfNeeded(event.id);
    }
}