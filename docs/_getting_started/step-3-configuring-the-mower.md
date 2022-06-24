---
title: "Configuring the Mower"
sub_title: What are the ways I can configure the mower?
excerpt: How do I configure the mower for different scenarios?
actions:
  - label: Previous
    icon: arrow-left
    relative_url: "/getting-started/step-2-discover-mowers"
---
There are two different scenarios that are currently supported by the plugin:
1. Enabling or disabling the schedule using the switch in HomeKit
2. Mowing or parking the mower using the switch in HomeKit.

Which scenario you want to use is entirely dependent on how you configure the Automower within the Husqvarna mobile app.

#### Scenario 1: Enabling or disabling the schedule using the switch in HomeKit
For this scenario, you intend on using the switch in HomeKit to control whether the mower will follow the preset schedule you've already configured.

What you'll need to do:
- Within the Husqvarna app, you need to configure the mower schedule such that it does not run all the time.

Because the mower is not set to always run, the button in turn ends up controlling whether the schedule is enabled, rather than whether the mower is actually mowing the yard.

#### Scenario 2: Mowing or parking the mower using the switch in HomeKit
For this scenario, you intend on using the switch in HomeKit to control when the mower is mowing in the yard. This can also use automation tasks within HomeKit to control when the mower is starting and stopping, rather than using the built-in clock on the mower.

What you'll need to do:
- Within the Husqvarna app, you need to configure the mower schedule mower such that it always runs (this is the default).

Because the mower is configured to always run, whenever the button is turned on the mower is allowed to continue it's schedule. Which given it has been configured to be always active, the mower will always begin to mow the lawn immediately when the switch is turned on.