# Setup Instructions
Due to the nature of how HOOBS configures the bridge, there is a couple additional steps that must be performed once the dev container is running.

### Initial HOOBS installation
- Launch HOOBS from VSCode
- Open a browser to http://localhost:8080
- Click continue with browser
- Click disable logins
- Let HOOBS complete its installation of all packages required (this may take some time).

### Adding the plugin
- Run the /opt/scripts/install.sh script
- Edit the /opt/hoobs/local/package.json file and add the plugin as a dependency.
- Restart HOOBS

### Configuring the plugin
- Open a browser to http://localhost:8080/plugin/homebridge-automower-platform
- Click Configuration
- Click Advanced
- Paste the following snippet (replacing the values as needed):

```json
{
  "platform": "Homebridge Automower Platform",
  "name": "Homebridge Automower Platform",
  "authentication_mode": "client_credentials",
  "appKey": "YOUR_APP_KEY",
  "application_secret": "YOUR_APP_SECRET"  
}
```
- Click Save
