# Contribution Guidelines
Thank you for showing interest in helping the project grow. Without external assistance, most projects don't last very long. So thank you for wanting to help!

## General
Are you looking to help out with the code? If so, the following general practices **MUST** be met for the changes to be accepted.

- The code **MUST** conform to SOLID design principles.
- Unit tests **MUST** be added to ensure consistency over time. Also, if critical sections of code is commented out, the unit test **MUST** fail.
- If you **ARE** a direct contributor of this project:
  - You **SHOULD** make your changes into this repository. Forks are permitted.
  - You **MUST** submit a pull request to change `main`.
- If you are **NOT** a direct contributor of this project:
  - You **MUST** fork this repository and perform your changes there.
  - You **MUST** submit a pull request from your fork, back to `main` of this repository.
- Any conflicts between the pull request **MUST** be handled by the pull request.
- An issue **MUST** be linked to your pull request.
- All SonarQube issues **MUST** be corrected.
- A contributing member of this repository **MUST** approve your pull request.

## Adding new language
So you want to help by adding support for a new language? That's great! Here's a list of things you'll want to do to keep everything consistent:
- Add a new json file under `locales/{filename}.json`
  - The `{filename}.json` **MUST** conform to the i18n language codes.
- The `config.schema.json` file **MUST** be updated to make use of the new file.
  - The language enum **MUST** have a new title and value added for the new language.
