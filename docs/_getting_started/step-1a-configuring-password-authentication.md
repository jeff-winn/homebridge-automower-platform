---
title: "Configuring Password Authentication"
excerpt: How do I configure Password authentication mode?
sub_title: To configure the plugin for password authentication mode, please follow these instructions...
actions:
  - label: Previous
    icon: arrow-left
    relative_url: "/getting-started/step-1-install-plugin"
  - label: Next
    icon: arrow-right
    relative_url: "/getting-started/step-2-discover-mowers"
---

While in the plugin configuration settings, and the Account Settings section expanded:
1. Select the Password authentication mode from the drop down.
2. Enter the Application Key: ```78e47163-dd2a-48bf-9af9-3cec8cadae00```
3. Enter the email address used for your Husqvarna Connect account.
4. Enter your password used for your Husqvarna Connect account.
{% include lightbox.html src="/assets/images/plugin-config-sample-password.png" title="An example of the plugin configuration user interface using Password authentication" class="thumbnail" %}
5. Click Save.

### Manually
Be advised, attempting to install the plug-in manually is undocumented and could result in your Homebridge server experiencing problems. If you wish to continue to install manually, you do so at your own risk.

For a sample of the configuration section needed for an instance of the platform you may use the following:
```json
{
  "platform": "Homebridge Automower Platform",
  "authentication_mode": "password",
  "appKey": "78e47163-dd2a-48bf-9af9-3cec8cadae00",
  "username": "<YOUR EMAIL ADDRESS>",
  "password": "<YOUR PASSWORD>"
}
```