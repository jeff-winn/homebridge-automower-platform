---
layout: home
paginate: false
alt_title: "Homebridge Automower Platform"
sub_title: "A Homebridge plugin for the Husqvarna Automower robotic lawn mower"
introduction: |
  This is a Homebridge plugin that lets you connect an already registered Husqvarna Automower to Apple HomeKit by using Homebridge.

  The plugin provides the following capabilities:
  - The current charge status and battery percentage for each mower.
  - A switch to control whether each mower:
    - *should* go and mow the property (based on configuration - see getting started).
    - *has* the schedule enabled or disabled.  
  - A motion sensor to indicate whether each mower:
    - *is* moving about the property.
    - *has* been tampered with (either by a human or other means) and needs assistance. **
    - *has* encountered a fault (which will require the Husqvarna app to troubleshoot) and needs assistance. **

  ** These features are not directly supported within the Apple HomeKit app and will require a 3rd party application (such as Controller for HomeKit) to use for any automations.

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
