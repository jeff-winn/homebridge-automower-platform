import { DataItem } from '../../../../src/clients/gardena/gardenaClient';
import { GardenaLocationEventStreamService } from '../../../../src/services/husqvarna/gardena/gardenaEventStreamService';

export class GardenaLocationEventStreamServiceSpy extends GardenaLocationEventStreamService {
    public unsafeOnEventReceived(event: DataItem): Promise<void> {
        return this.onEventReceived(event);
    }
}