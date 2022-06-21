# homebridge-automower-platform
[![CI](https://github.com/jeff-winn/homebridge-automower-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/jeff-winn/homebridge-automower-platform/actions/workflows/ci.yml)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform) [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=homebridge-automower-platform&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=homebridge-automower-platform)

[Homebridge](https://github.com/homebridge/homebridge) plugin for controlling [Husqvarna Automower](https://www.husqvarna.com/us/robotic-lawn-mowers/) as [Apple HomeKit](https://www.apple.com/ios/home/) accessories.

Supported capabilities:
- The current charge status and battery percentage for each mower.
- A switch to control whether each mower has their schedule enabled or disabled.
- A motion sensor to indicate whether each mower is moving about the property.

Additional capabilities:
- Does not cause logout of Husqvarna mobile application.

For help installing and configuring the plugin, please see the documentation found at:
https://jeff-winn.github.io/homebridge-automower-platform
