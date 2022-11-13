---
title: "Configuring Client Credentials Authentication"
excerpt: How do I configure Client Credentials authentication mode?
sub_title: To configure the plugin for client credentials authentication mode, please follow these instructions...
actions:
  - label: Previous
    icon: arrow-left
    relative_url: "/getting-started/step-1-install-plugin"
  - label: Next
    icon: arrow-right
    relative_url: "/getting-started/step-2-discover-mowers"
---

### Manually
Be advised, attempting to install the plug-in manually is undocumented and could result in your Homebridge server experiencing problems. If you wish to continue to install manually, you do so at your own risk.

For a sample of the configuration section needed for an instance of the platform you may use the following:
```json
{
  "platform": "Homebridge Automower Platform",
  "authentication_mode": "client_credentials",
  "appKey": "<YOUR APPLICATION KEY>",
  "application_secret": "<YOUR APPLICATION SECRET>"
}
```