# Releasing Guidelines

The following describes how to perform a proper release of the plug-in to ensure operational consistency between versions. This will keep trust of the plug-in high, while also helping find changes that Apple contributes within HomeKit that indirectly affects the plug-in.

## Preparation for Release
To begin preparation for a release, a release candidate is suggested but not required. The following steps describe how to do a release to ensure consistency between releases.

1. Create a new release candidate:
    - The tag **MUST** match the convention `v{x.x.x}-rc.{v}` where `{x.x.x}` is the release version and `{v}` is the release candidate version.
    - The title **MUST** match the tag version.
    - Click the *Generate release notes* button.
    - Ensure the *Pre-release* checkbox **IS** checked.
    - Ensure the *Latest release* checkbox is **NOT** checked.
    - Click Publish.
2. The publishing of a new release candidate will trigger the publish GitHub workflow and promote the changes automatically to the npmjs.com website.
3. On the 'Production' Homebridge server:
    - Update the plug-in version to the release candidate version.
    - Restart Homebridge.
4. Validate the candidate is ready for release:
    - Verify all switches and sensors are named appropriately in HomeKit.
    - Verify all switches and sensors are triggered appropriately when:
      - Mower is controlled within HomeKit
      - Mower is externally controlled within the Automower Connect mobile app.
5. A one week wait period **SHOULD** be in between the last Release Candidate published and the final Release version published.
    - This will give users adequate time to update and possibly file new bugs related to the release.

## Publish a Release
To perform a release of the plug-in the following steps must be performed:

1. Create a new release:
    - The tag **MUST** match the convention `v{x.x.x}` where `{x.x.x}` is the release version of the last release candidate.
    - The title **MUST** match the tag version.
    - Click the *Generate release notes* button.
    - Ensure the *Pre-release* checkbox is **NOT** checked.
    - Ensure the *Latest release* checkbox **IS** checked.
    - Click Publish.
2. On the 'Production' Homebridge server:
    - Update the plug-in version to the release version.
    - Restart Homebridge.

## Patch a Release
To patch an existing release of the plug-in the following steps must be performed:

1. Decide whether a patch release is necessary:
   - For non-critical bugs, the next expected release **SHOULD** be used.
   - For critical bugs (those bugs identified with the critical label) must be fixed immediately and a patch release **SHOULD** be used.
2. From the `v{x.x.x}` version tag, create a new branch named `patch/v{x.x.x}`.
3. Fix the bug. Additional unit tests **MUST** be added which exhibits the previous behavior and enforces the correct behavior.
4. Follow the steps to Publish a Release.
   - The patch branch **MUST** be used as the release target.
   - The release version **MUST** be `v{x.x.p}` where `{x.x` is the major and minor of the release being patched, and `.p}` is the incremental patch number.

