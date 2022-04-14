import { API, HAP, Logging, PlatformAccessory } from 'homebridge';
import { Mock } from 'moq.ts';
import { AutomowerAccessory, AutomowerContext } from '../src/automowerAccessory';
import { AutomowerPlatform } from '../src/automowerPlatform';

describe('automower accessory', () => {
    let platform: Mock<AutomowerPlatform>;
    let accessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<Logging>;

    let target: AutomowerAccessory;

    beforeEach(() => {
        platform = new Mock<AutomowerPlatform>();
        accessory = new Mock<PlatformAccessory<AutomowerContext>>();
        api = new Mock<API>();
        hap = new Mock<HAP>();
        log = new Mock<Logging>();

        api.setup(x => x.hap).returns(hap.object());

        target = new AutomowerAccessory(platform.object(), accessory.object(), api.object(), log.object());
    });

    it('returns the accessory uuid', () => {
        const uuid = '12345';

        accessory.setup(x => x.UUID).returns(uuid);

        const result = target.getUuid();
        expect(result).toBe(uuid);
    });
});