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

This authentication mode requires an application key and application secret found by registering a developer account with Husqvarna Group cloud services. This is done to ensure your username and password are not being leaked to 3rd party applications, such as this Homebridge plugin.

1. Navigate your browser to: <a href="https://developer.husqvarnagroup.cloud">https://developer.husqvarnagroup.cloud</a>
2. Click Signup.
3. Enter your information on the Signup form. Be sure to use the same email address and password you used to login to the Automower Connect mobile app.
4. After signing in, you should be brought to the 'My Applications' page.
5. Click New Application.
  - Enter your new application name, for example: ```homebridge-automower-platform```
  - Enter your redirect URL, this value is not relevant to client credentials, so ```http://localhost``` can be used.
  - Click the Create button.
7. Click the Connect New API button (you will need to connect the following APIs from the list available):
  - Authentication API
  - Automower Connect API
8. Copy the Application key and paste it into the Application Key box. If you have an existing Application Key here, it needs to be replaced with your own value.
9. Copy the Application secret and paste it into the Application Secret box.
10. Click Save.
11. Restart Homebridge.

Your configuration should look like this:

{% include lightbox.html src="/assets/images/plugin-config-sample-client-credentials.png" title="An example of the plugin configuration user interface using Client Credentials authentication" class="thumbnail" %}

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