---
title: About
layout: page
---

The Homebridge Automower Platform is a platform plugin for [Homebridge](https://homebridge.io/). This plugin is designed to allow you to control your [Husqvarna Automower](https://www.husqvarna.com/us/robotic-lawn-mowers/) through [Apple HomeKit](https://www.apple.com/ios/home/).

The project started within my own home to control the Automower so that:
- I could disable the schedule temporarily **(using automation)** when it was raining outside.
- Resume the schedule **(using automation)** once it stopped raining outside.
- Reduce the wear-and-tear on the Automower even though it can work in the rain.
- Reduce the number of cleanings due to the rain causing the grass clippings to excessively stick to the mower.

The use case did require the building of a couple other components (including a Raspberry Pi) but in the end the project was a complete success. For additional links on the other required components, see the following:
- [Homebridge VEML7700 Sensor](https://github.com/jeff-winn/homebridge-veml7700-sensor)
- [dotNET VEML7700](https://github.com/jeff-winn/dotnet-veml7700)