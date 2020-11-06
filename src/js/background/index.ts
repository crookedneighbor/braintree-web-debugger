import "../../img/icon-128.png";
import "../../img/icon-34.png";
import "../../img/braintree-logo.jpg";

import { getURL, onBeforeRequest } from "Browser/runtime";
const fakeBraintreeUrl = getURL("fake-braintree.bundle.js");

const BASE_ASSET_URL = "://js.braintreegateway.com/web/";

function isV3ComponentScript(url: string) {
  return url.indexOf(`${BASE_ASSET_URL}3.`) > -1;
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
