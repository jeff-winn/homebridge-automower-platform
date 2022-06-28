---
layout: home
paginate: false
alt_title: "Homebridge Automower Platform"
sub_title: "A Homebridge plugin for the Husqvarna Automower robotic lawn mower"
introduction: |
  This is a Homebridge plugin that lets you connect an already registered Husqvarna Automower to Apple HomeKit by using Homebridge.

  The plugin provides the following capabilities:
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
  - Does not cause logout of the Husqvarna mobile application.
  - Multiple languages may be supported in logs (need help with translations).

actions:
  - label: "Get Started"
    icon: arrow-right
    relative_url: "/getting-started"
  - label: "GitHub"
    icon: github
    url: "https://github.com/jeff-winn/homebridge-automower-platform"
---
