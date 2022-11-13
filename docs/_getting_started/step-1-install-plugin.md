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
    - Change the name (if desired).
    - Change the language (if desired).
    - There are currently multiple authentication modes supported. This will determine how the plugin will access your Automower managed by the Husqvarna cloud services:
      - To configure Client Credentials authentication, you can follow the instructions found <a href="/getting-started/step-1b-configuring-client-credentials-authentication">here</a>.
      - To configure Password authentication, you can follow the instructions found <a href="/getting-started/step-1a-configuring-password-authentication">here</a>. Be advised, this mode of authentication is no longer supported by Husqvarna and may discontinue working without warning.
6. Restart Homebridge.