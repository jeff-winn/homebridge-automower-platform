---
title: "Installation"
excerpt: How do I install the plugin?
sub_title: To install the plugin please follow these instructions...
actions:
  - label: Next
    icon: arrow-right
    relative_url: "/getting-started/step-2-discover-mowers"
---
This assumes you already have the Homebridge configured and working correctly.

### Using the Homebridge user interface
1. Login to Homebridge.
2. Click the Plugins menu option.
3. In the "Search for plugins to install" box enter: **homebridge-automower-platform**

{% include lightbox.html src="/assets/images/homebridge-installation-textbox.png" title="An example of the installation box in Homebridge" class="thumbnail" %}

4. Locate the **Homebridge Automower Platform** by @jeff-winn within the list and click Install.
5. To configure the plugin:
  - Change the name from the default value (if desired).
  - Enter the email address used for your Husqvarna Connect account.
  - Enter your password used for your Husqvarna Connect account.

{% include lightbox.html src="/assets/images/plugin-config-sample.png" title="An example of the plugin configuration user interface" class="thumbnail" %}

6. Restart Homebridge.

### Manually
Be advised, attempting to install the plug-in manually is undocumented and could result in your Homebridge server experiencing problems. If you wish to continue to install manually, you do so at your own risk.

For a sample of the configuration section needed for an instance of the platform you may use the following:
```
{
  "platform": "Homebridge Automower Platform",
  "appKey": "78e47163-dd2a-48bf-9af9-3cec8cadae00",
  "username": "<YOUR EMAIL ADDRESS>",
  "password": "<YOUR PASSWORD>"
}
```