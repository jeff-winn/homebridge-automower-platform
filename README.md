# Homebridge Automower Platform
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

[![build](https://github.com/jeff-winn/homebridge-automower-platform/actions/workflows/build.yml/badge.svg)](https://github.com/jeff-winn/homebridge-automower-platform/actions/workflows/build.yml) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform) [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform)

A plugin for controlling [Husqvarna Automower](https://www.husqvarna.com/us/robotic-lawn-mowers/) and [Gardena Smart](https://www.gardena.com/int/products/lawn-care/robotic-mower/) robotic lawn mowers as [Apple HomeKit](https://www.apple.com/ios/home/) accessories using the [Husqvarna Group](https://developer.husqvarnagroup.cloud) cloud services.

Be advised, because this plug-in uses cloud services, service disruptions or outages are possible as it relies solely on the aforementioned cloud services to manage the communication with your mowers(s).

## Installation
For help installing and configuring the plugin, please see the documentation found at:
https://jeff-winn.github.io/homebridge-automower-platform

## Hardware Requirements
The following hardware requirements are necessary for the proper operation of the plug-in. If you are unsure whether your mower is supported by the plug-in, you can find the compatibility matrix [HERE](https://jeff-winn.github.io/homebridge-automower-platform/extras/compatibility-matrix).

- The Automower *must* have an Automower Connect module installed, Bluetooth only models will require an upgrade. For more information, please contact your local Husqvarna Automower dealer.
- The Sileno *must* be a Smart series mower which you can control remotely via an app while not near the device, Bluetooth only models are not supported.

## Known Issues
- Starting with iOS 16, Apple has changed their naming scheme within HomeKit such that all services for an accessory use the accessory name. If all the switches and sensors are named after your mower, and you are using 1.4.0 or later of the plug-in, removing the mower using the instructions found [HERE](https://jeff-winn.github.io/homebridge-automower-platform/extras/removing-mower) should correct the issue.

## Supported Capabilities
Be advised, the capabilities mentioned below vary between product lines by Husqvarna. Depending on the type of robotic mower you are using, different capabilities will be provided by the plug-in.

- A switch to control whether each mower (based on configuration - see documentation):
  - *should* mow the property.
  - or *has* the on-board schedule enabled or disabled.
- A pause switch to control whether each mower:
  - *should* pause while mowing on the property, and resume once the switch is turned off.
- A motion sensor to indicate whether each mower:
  - *is* moving about the property.
  - *has* been tampered with (requires the Husqvarna app to troubleshoot) and needs assistance. **
  - *has* encountered a fault (requires the Husqvarna app to troubleshoot) and needs assistance. **
- A contact sensor to indicate when each mower:
  - *is* going to the charge station, by indicating open contact state.
  - *has* arrived home, or resumed operation, by indicating closed contact state.
- A contact sensor to indicate when each mower:
  - *is* leaving the charge station, by indicating open contact state.
  - *has* left home, or returned home, by indicating closed contact state.
- A custom characteristic to modify the cutting height of the mower. **

** These features are not directly supported within the Apple HomeKit app and will require a 3rd party application (such as Controller for HomeKit) to use for any automations.

## Additional Capabilities:
- The sensors may now be turned on or off based on your personal needs within the configuration settings.
- Streams events from Husqvarna rather than polling for changes. This allows you to run automations without having to worry about the timing of when a change is noticed, it should be within a few seconds.
- Does not cause logout of Husqvarna mobile application.
- Multiple languages may be supported in logs (need help with translations).

## Configuration Settings
The following describes the configuration settings available within the plugin. If you are using Homebridge, manually configuring the plugin is highly discouraged. However, the section is described as follows:

```json
{
  "platform": "Homebridge Automower Platform",
  "name": "Homebridge Automower Platform",
  "device_type": "automower",
  "sensor_mode": "all",
  "lang": "en",
  "authentication_mode": "client_credentials",
  "appKey": "<<REDACTED>>",
  "application_secret": "<<REDACTED>>"
}
```

- _platform_: This __MUST__ be "Homebridge Automower Platform"
- _name_: This will be the name of the plugin that shows up in the logs
- _device_type_: This determines which kind of mower is being configured. The following device types are supported:
  - _automower_: For use with Husqvarna Automower robotic lawn mowers
  - _gardena_: For use with Gardena Smart robotic lawn mowers
- _sensor_mode_: This determines which sensors will be registered for each mower that is located. The following sensor modes are supported:
  - _all_: All sensors available
  - _motion_only_: Only motion sensors will be registered
  - _contact_only_: Only contact sensors will be registered
  - _none_: No sensors
- _lang_: This will be the language used during logging. The following languages are supported:
  - _en_: English (US)
- _authentication_mode_: The type of authentication modes available to login to Husqvarna Group cloud services. The following authentication modes are supported:
  - _client_credentials_: Uses an application key and secret defined by the Husqvarna Group cloud services to login. This will require additional setup on their website
- _appKey_: This is the application key as registered on the Husqvarna Group cloud services
- _application_secret_: This is the application secret as registered on the Husqvarna Group cloud services

Other Settings:
These settings will likely never be required unless explicitly asked to do so by someone helping maintain the plugin. These will not able to be configured in the plugin settings by the user interface, and manually editing the config section will be needed. These settings may change at any time, without warning.

- _logger_type_: Used to change how the plugin logs information to the output stream. This is here to aid with debugging issues that may occur in the plugin.
  - _default_: This is the default mode, nothing to see here
  - _imitation_: This mode allows debug logging based on an environment configuration setting
  - _force_debug_: This is likely the easiest approach to debugging just this plugin, without having to debug all plugins on a server

## Disclaimer
This plug-in is in no way affiliated with Husqvarna, the Husqvarna Group, or any of its subsidiaries or partners. Any trademarks used here-in are property of Husqvarna and/or the Husqvarna Group.
