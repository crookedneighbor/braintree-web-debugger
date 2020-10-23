import bus from "framebus";
import { loadScript } from "@braintree/asset-loader";

import type {
  BraintreeComponent,
  Component,
} from "../types/braintree-sdk-metadata";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    braintree: any;
    braintreeDebugger: {
      metadataSent: boolean;
      componentData: {
        [prop: string]: Component;
      };
    };
  }
}

bus.emit("FAKE_BRAINTREE_READY");
bus.on("MAIN_EXTENSION_READY", (data: unknown, reply: () => void) => {
  reply();
});

const COMPONENT_NAME_MAP: Record<string, string> = {
  "three-d-secure": "3D Secure",
};
const myself = document.currentScript as HTMLScriptElement;
const originalSrc = myself.src;
const urlParts = originalSrc.split("/");
const component = urlParts
  .find((part) => part.indexOf(".js") > -1)
  ?.replace(/(.min)?.js/, "") as string;
const version = urlParts.find((part) => part.indexOf("3.") > -1) as string;
// https://hisk.io/javascript-snake-to-camel/
const componentInCamelCase = component.replace(/([-_][a-z])/g, (group) =>
  group.toUpperCase().replace("-", "").replace("_", "")
);
const componentName =
  component in COMPONENT_NAME_MAP
    ? COMPONENT_NAME_MAP[component]
    : component
        .replace(/([-_][a-z])/g, (group) =>
          group.toUpperCase().replace("-", " ").replace("_", " ")
        )
        .replace(/^[a-z]/, (group) => group.toUpperCase());

const braintree = (window.braintree = window.braintree || {});
const braintreeDebugger = (window.braintreeDebugger = window.braintreeDebugger || {
  metadataSent: false,
  componentData: {},
});

braintreeDebugger.componentData[component] = {
  key: component,
  name: componentName,
  nameInCamelCase: componentInCamelCase,
  version,
  minified: originalSrc.indexOf(".min.js") > -1,
  log: [],
};

braintree[componentInCamelCase] = {
  create: (
    ...args: [
      BraintreeComponent,
      (err: Error | null, instance?: BraintreeComponent) => void
    ]
  ) => {
    braintreeDebugger.componentData[component].createArgs = args.map((arg) => {
      if (typeof arg === "function") {
        return "Function";
      }
      if (arg && arg.client) {
        return Object.assign({}, arg, { client: "<Client Instance>" });
      }
    }) as Component["createArgs"];

    // delete our fake version so the real script can load correctly
    delete braintree[componentInCamelCase];

    return loadScript({
      src: originalSrc + "?do-not-block=true",
    })
      .then(() => {
        return braintree[componentInCamelCase]
          .create(args[0])
          .then((instance: BraintreeComponent) => {
            braintreeDebugger.componentData[component].instance = instance;

            return new Proxy(instance, {
              get(target, prop, receiver) {
                const targetValue = Reflect.get(target, prop, receiver);

                if (typeof targetValue === "function") {
                  return function (...functionArgs: unknown[]) {
                    bus.emit("COMPONENT_FUNCTION_CALL", {
                      component,
                      functionName: prop,
                      args: functionArgs.map((arg) => {
                        if (typeof arg === "function") {
                          return "Function";
                        }

                        return arg;
                      }),
                    });
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    return targetValue.apply(this, functionArgs);
                  };
                }

                return targetValue;
              },
            });
          });
      })
      .then((instance) => {
        if (
          !window.braintreeDebugger.metadataSent &&
          version.charAt(0) === "3"
        ) {
          let client;
          if (component === "client") {
            client = instance;
          } else {
            client =
              instance._clientPromise || instance._client || instance.client;
          }
          if (client) {
            window.braintreeDebugger.metadataSent = true;
            Promise.resolve(client).then((client) => {
              bus.emit("CLIENT_METADATA", client.getConfiguration());
            });
          }
        }
        const details = braintreeDebugger.componentData[component];

        bus.emit("COMPONENT_DETAILS", details);

        if (!args[1]) {
          return instance;
        }

        if (typeof args[1] === "function") {
          args[1](null, instance);
        }
      })
      .catch((err) => {
        if (typeof args[1] === "function") {
          args[1](err);
        }
      });
  },
  VERSION: version,
  // some components have other global methods
  // for masterpass/paypal/paypal-checkout
  isSupported() {
    return true;
  },
  // for hosted fields
  supportsInputFormatting() {
    return true;
  },
  // method specific to Venmo
  isBrowserSupported() {
    return false;
  },
};
