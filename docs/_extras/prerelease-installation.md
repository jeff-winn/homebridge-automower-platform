---
title: Installing the next version
sub_title: Are you interested in testing out the next release of the plug-in before it is actually released?
introduction: |
    Please keep in mind, the use of the next version of the plug-in while tested is used completely at your own risk. If you experience any problems with the next version, please help the community by creating a bug report [HERE](https://github.com/jeff-winn/homebridge-automower-platform/issues/new?assignees=&labels=bug&template=bug-report.md).
---
To install the "next" version of the plug-in, the installation process is a little different from the usual installation of a plug-in or upgrading to the newest version.

Please follow the instructions below:
1. Open the Homebridge UI.
2. Follow the typical plug-in installation instructions.
3. After the plug-in has installed, you will need to modify your version installed to be the next version by:
   - Open the Homebridge UI Plugins menu.
   - Find the plug-in within your installed list of plug-ins.
   - Click the '...' icon.
   - Click `Manage Version`
   - From the dialog that is displayed, select the next version you wish to install. The 'next' builds are what changes have been actively made since the last release.
   - Click the `Install` button.
4. Restart Homebridge.

Once Homebridge has restarted, you will likely see an `Update` button appear on the Homebridge UI for the plug-in. This is expected, as the "next" version is not actually the "latest" version. This is done to prevent everyone upgrading prematurely.