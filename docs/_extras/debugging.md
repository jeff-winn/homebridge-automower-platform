---
title: Debugging
sub_title: Trying to figure out what's going on with the plugin? We've got you covered.
introduction: |
    One of the biggest headaches with plugins is when they're not working like you'd expect them to. Diagnosing problems can be even further complicated because the server which is running the plugin is inaccessible to the developer of the plugin.
---
To enable debug level logging, please follow the instructions provided here.

WARNING: Enabling DEBUG logging **WILL** show log entries that are sensitive and can be used to perform session hijacking. Do not give these logs out to anyone without removing the sensitive information.

### How to enable debug mode:
- Open the Homebridge UI.
- Open the Homebridge Settings menu.
- In the environment variables section, enter the following value into the DEBUG text box:
```
homebridge-automower-platform
```
- Restart Homebridge.

At this point, you should begin seeing additional log entries. To revert the change, just remove the DEBUG environment variable and restart your Homebridge server.
