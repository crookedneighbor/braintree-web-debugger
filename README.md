# Browser Extension Template

A template for creating browser extensions in Typescript.

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
