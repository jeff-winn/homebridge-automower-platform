
import * as fs from 'fs';
import { Environment } from '../../primitives/environment';
import { GardenaClient, GetLocationResponse, GetLocationsResponse } from './gardenaClient';

/**
 * A {@link GardenaClient} which uses sample files to simulate responses from the server.
 */
export class SampleGardenaClientImpl implements GardenaClient {
    public constructor(private env: Environment) { }

    public getLocations(): Promise<GetLocationsResponse | undefined> {
        const txt = fs.readFileSync(this.getLocationsSampleFile(), 'utf-8');

        const result = JSON.parse(txt) as GetLocationsResponse;
        return Promise.resolve(result);
    }

    protected getLocationsSampleFile(): string {
        return this.env.unsafeGetEnvironmentVariable('GET_LOCATIONS_SAMPLE')!;
    }

    public getLocation(): Promise<GetLocationResponse | undefined> {
        const txt = fs.readFileSync(this.getSingleLocationSampleFile(), 'utf-8');

        const result = JSON.parse(txt) as GetLocationResponse;
        return Promise.resolve(result);
    }

    protected getSingleLocationSampleFile(): string {
        return this.env.unsafeGetEnvironmentVariable('GET_SINGLE_LOCATION_SAMPLE')!;
    }
}