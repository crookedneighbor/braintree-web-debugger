# Braintree Web Debugger

A browser extension for debugging Braintree's web sdk. It checks if v3 of the Braintree web sdk was loaded on the page and provides information about how the SDK was loaded.

Currently only supports integrations using the Braintree CDN to load the JavaScript files.

## Contributing

Checkout the [contributing guide](./CONTRIBUTING.md) for info about how to contribute.

## Packing for Production

When a version is ready for release run:

```sh
$ NODE_ENV=production npm run build
```

Now, the content of `build/google_chrome` and `build/firefox` folders will be the extension in a state ready to be submitted to the Chrome Web Store and Mozilla Add-ons.

Just take a look at the [official guide](https://developer.chrome.com/webstore/publish) to more infos about publishing in the Chrome Web Store.

## Tests

Unit tests are run via jest.

```
npm test
```
