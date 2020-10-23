# Contributing to Braintree Web Debugger

Contributions are very welcome!

## Development

The project is built using webpack to build a Chrome and Firefox extension. You will need [Node](https://nodejs.org/) and npm to run the project locally.

1. Install the node dependencies:

   ```sh
   npm install
   ```

1. Start the development server:

   ```sh
   $ npm start
   $ # use `BROWSER=FIREFOX npm start` if you prefer to develop in Firefox
   ```

1. Add the unpacked extension to Chrome. See [steps 1-3 here](https://developer.chrome.com/extensions/getstarted#manifest).

1. You're done! Any changes you make in the code will be built automatically, but the unpacked extension will need to be updated to get those changes. Navigate to `chrome://extensions` and select the refresh icon in the unpacked extension.

## Project Structure

The bulk of the project is in the src/js directory. It's split up into a few various parts.

### Main

This is the main entry point for the extension. It's what gets loaded onto the page.

### Options page

A page where each of the features is displayed with ways to configure them.

### Background script

This script is responsible for a few things:

- <List what it's responsible for>

## Expectations

### Automated Testing

When you add or change a feature, it's expected that a test will go along with it. If you've never written an automated test before, don't worry! Open a PR anyway and I'll be happy to help you along.

## Gotchas

### Creating HTML Elements

Firefox doesn't like the `innerHTML =` method of setting the value of an HTMLElement. Because of this, use the `Lib/create-element` helper instead. This will return a document fragment, so you may need to use `.firstChild` if you've created a single HTML container.

### Styling

Always use a `css` file for setting styles. Again, Firefox has issues when using inline styles.
