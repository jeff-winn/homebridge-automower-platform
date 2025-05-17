import {
    AutomowerEvent, AutomowerEventStreamClient, AutomowerEventTypes, BatteryEvent, CalendarEvent, CuttingHeightEvent, MowerEvent, PlannerEvent
} from '../../../clients/automower/automowerEventStreamClient';
import { PlatformLogger } from '../../../diagnostics/platformLogger';
import { MowerStatusChangedEvent } from '../../../events';
import { Timer } from '../../../primitives/timer';
import { AccessTokenManager } from '../accessTokenManager';
import { AbstractEventStreamService } from '../eventStreamService';
import { AutomowerMowerScheduleConverter } from './converters/automowerMowerScheduleConverter';
import { AutomowerMowerStateConverter } from './converters/automowerMowerStateConverter';

/**
 * An event streaming services which handles Automower events.
 */
export class AutomowerEventStreamService extends AbstractEventStreamService<AutomowerEventStreamClient> {
    private readonly lastCuttingHeightEvents = new Map<string, CuttingHeightEvent>();
    private readonly lastCalendarEvents = new Map<string, CalendarEvent>();
    private readonly lastPlannerEvents = new Map<string, PlannerEvent>();
    private readonly lastMowerEvents = new Map<string, MowerEvent>();
    private readonly lastBatteryEvents = new Map<string, BatteryEvent>();

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
            case AutomowerEventTypes.BATTERY:
                return this.onBatteryEvent(event as BatteryEvent);

            case AutomowerEventTypes.CALENDAR:
                return this.onCalendarEvent(event as CalendarEvent);

            case AutomowerEventTypes.CUTTING_HEIGHT:
                return this.onCuttingHeightEvent(event as CuttingHeightEvent);

            case AutomowerEventTypes.MOWER:
                return this.onMowerEvent(event as MowerEvent);

            case AutomowerEventTypes.PLANNER:
                return this.onPlannerEvent(event as PlannerEvent);

            case AutomowerEventTypes.HEADLIGHTS:
            case AutomowerEventTypes.MESSAGE:
            case AutomowerEventTypes.POSITION:
                return Promise.resolve(undefined); // Ignore the (s).
        
            default:
                this.log.warn('RECEIVED_UNKNOWN_EVENT', event.type);
                return Promise.resolve(undefined);
        }
    }
    
    protected async onCuttingHeightEvent(event: CuttingHeightEvent): Promise<void> {
        this.lastCuttingHeightEvents[event.id] = event;

        if (event.attributes.cuttingHeight !== undefined) {
            await this.raiseMowerSettingsChangedEvent({
                mowerId: event.id,
                attributes: {
                    settings: {
                        cuttingHeight: event.attributes.cuttingHeight.height
                    }
                }
            })
        }
    }    

    protected async onPlannerEvent(event: PlannerEvent): Promise<void> {
        this.lastPlannerEvents[event.id] = event;

        await this.raiseMowerScheduleChangedEventIfNeeded(event.id);
        await this.raiseMowerStatusChangedEventIfNeeded(event.id);
    }

    protected async onCalendarEvent(event: CalendarEvent): Promise<void> {
        this.lastCalendarEvents[event.id] = event;

        await this.raiseMowerScheduleChangedEventIfNeeded(event.id);
    }

    protected async raiseMowerScheduleChangedEventIfNeeded(mowerId: string): Promise<void> {
        const lastCalendarEvent = this.lastCalendarEvents[mowerId];
        const lastPlannerEvent = this.lastPlannerEvents[mowerId];

        if (lastCalendarEvent === undefined || lastCalendarEvent.attributes.calendar === undefined || lastPlannerEvent === undefined) {
            // Both pieces of data are required for the conversion.
            return;
        }

        await this.raiseMowerSettingsChangedEvent({
            mowerId: mowerId,
            attributes: {
                schedule: this.scheduleConverter.convertPlannerAndCalendar(lastPlannerEvent.attributes.planner, lastCalendarEvent.attributes.calendar)
            }
        });
    }

    protected async onBatteryEvent(event: BatteryEvent): Promise<void> {
        this.lastBatteryEvents[event.id] = event;

        await this.raiseMowerStatusChangedEventIfNeeded(event.id);
    }

    protected async onMowerEvent(event: MowerEvent): Promise<void> {
        this.lastMowerEvents[event.id] = event;

        await this.raiseMowerStatusChangedEventIfNeeded(event.id);
    }

    protected async raiseMowerStatusChangedEventIfNeeded(mowerId: string): Promise<void> {
        let e: MowerStatusChangedEvent = {
            mowerId: mowerId,
            attributes: {
                connection: {
                    connected: true
                }
            }
        };

        const lastMowerEvent = this.lastMowerEvents[mowerId];
        if (lastMowerEvent !== undefined && lastMowerEvent.attributes !== undefined) {            
            e.attributes.mower = this.stateConverter.convertMowerState(lastMowerEvent.attributes.mower);
        }

        const lastBatteryEvent = this.lastBatteryEvents[mowerId];
        if (lastBatteryEvent !== undefined && lastBatteryEvent.attributes !== undefined) {
            e.attributes.battery = {
                level: lastBatteryEvent.attributes.battery.batteryPercent
            };
        }

        await this.raiseMowerStatusChangedEvent(e);
    }
}