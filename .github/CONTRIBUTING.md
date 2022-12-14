# Contribution Guidelines
Thank you for showing interest in helping the project grow. Without external assistance, most projects don't last very long. So thank you for wanting to help!

## Adding new language
So you want to help by adding support for a new language? That's great! Here's a list of things you'll want to do to keep everything consistent:
- Add a new json file under `locales/{filename}.json`
  - The `{filename}.json` **MUST** conform to the i18n language codes.
- The `config.schema.json` file **MUST** be updated to make use of the new file.
  - The language enum **MUST** have a new title and value added for the new language.
