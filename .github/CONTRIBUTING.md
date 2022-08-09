# Contributing to Homebridge Automower Platform
Thank you for showing interest in helping the project grow. Without external assistance, most projects don't last very long. So thank you for wanting to help!

## Adding new language
So you want to help by adding support for a new language? That's great! Here's a list of things you'll want to do to keep everything consistent:
- Add a new json file under locales/{_filename_}.json
  - The _filename_ must conform to the i18n language codes.
- The _config.schema.json_ file must be updated to make use of the new file.
  - The language enum must have a new title and value added for your new language.
