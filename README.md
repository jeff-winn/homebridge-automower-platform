# Homebridge Automower Platform
[![CI](https://github.com/jeff-winn/homebridge-automower-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/jeff-winn/homebridge-automower-platform/actions/workflows/ci.yml)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform) [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform)

[Homebridge](https://github.com/homebridge/homebridge) plugin for controlling [Husqvarna Automower](https://www.husqvarna.com/us/robotic-lawn-mowers/) as [Apple HomeKit](https://www.apple.com/ios/home/) accessories.

Supported capabilities:
- The current charge status and battery percentage for each mower.
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
  - *is* going to the charge station, by indicating contact detected. **
  - *has* arrived home, or resumed operation, by indicating contact not detected. **

** Some features are not directly supported within the Apple HomeKit app for automation and will require a 3rd party application (such as Controller for HomeKit) to use for any automations.

Additional capabilities:
- Does not cause logout of Husqvarna mobile application.
- Multiple languages may be supported in logs (need help with translations).

For help installing and configuring the plugin, please see the documentation found at:
https://jeff-winn.github.io/homebridge-automower-platform
