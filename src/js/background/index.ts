import "../../img/icon-128.png";
import "../../img/icon-34.png";
import "../../img/braintree-logo.jpg";

import { getURL, onBeforeRequest } from "Browser/runtime";
const fakeBraintreeUrl = getURL("fake-braintree.bundle.js");

onBeforeRequest({
  addListener: (details) => {
    if (
      details.url.indexOf("://js.braintreegateway.com/web/3") > -1 &&
      details.url.indexOf("?do-not-block=true") === -1
    ) {
      return { redirectUrl: fakeBraintreeUrl };
    }
  },
  config: { urls: ["<all_urls>"] },
  permissions: ["blocking"],
});
