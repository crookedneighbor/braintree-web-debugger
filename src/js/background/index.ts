import "../../img/icon-128.png";
import "../../img/icon-34.png";
import "../../img/braintree-logo.jpg";

import { getURL, onBeforeRequest } from "Browser/runtime";
import deriveComponentDataFromScriptUrl from "../lib/derive-component-data-from-script-url";
const fakeBraintreeUrl = getURL("fake-braintree.bundle.js");

const BASE_ASSET_URL = "://js.braintreegateway.com/web/";

function isV3ComponentScript(url: string) {
  const isV3Component = url.indexOf(`${BASE_ASSET_URL}3.`) > -1;

  if (!isV3Component) {
    return false;
  }

  const { semverVersion } = deriveComponentDataFromScriptUrl(url);

  // before v3.14.0, the components had a different create signature
  // that is incompatible with the extension
  return Number(semverVersion.major) === 3 && Number(semverVersion.minor) > 13;
}

function isV1DropinScript(url: string) {
  return url.indexOf(`${BASE_ASSET_URL}dropin/1.`) > -1;
}

onBeforeRequest({
  addListener: ({ url }) => {
    if (
      (isV3ComponentScript(url) || isV1DropinScript(url)) &&
      url.indexOf("?do-not-block=true") === -1
    ) {
      return { redirectUrl: fakeBraintreeUrl };
    }
  },
  config: { urls: ["<all_urls>"] },
  permissions: ["blocking"],
});
