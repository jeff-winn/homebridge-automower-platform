# homebridge-automower-platform
[![CI](https://github.com/jeff-winn/homebridge-automower-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/jeff-winn/homebridge-automower-platform/actions/workflows/ci.yml)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform) [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform)

[Homebridge](https://github.com/homebridge/homebridge) plugin for controlling [Husqvarna Automower](https://www.husqvarna.com/us/robotic-lawn-mowers/) as [Apple HomeKit](https://www.apple.com/ios/home/) accessories.

Supported capabilities:
- The current charge status and battery percentage for each mower.
- A switch to control whether each mower:
  - *should* go and mow the property (based on configuration - see documentation).
  - *has* the schedule enabled or disabled.  
- A motion sensor to indicate whether each mower:
  - *is* moving about the property.
  - *has* been tampered with (either by a human or other means) and needs assistance. **
  - *has* encountered a fault (which will require the Husqvarna app to troubleshoot) and needs assistance. **

** These features are not directly supported within the Apple HomeKit app and will require a 3rd party application (such as Controller for HomeKit) to use for any automations.

Additional capabilities:
- Does not cause logout of Husqvarna mobile application.
- Multiple languages may be supported in logs (need help with translations).

For help installing and configuring the plugin, please see the documentation found at:
https://jeff-winn.github.io/homebridge-automower-platform
