import { loadScript } from "@braintree/asset-loader";

import type {
  BraintreeComponentEntryPoint,
  BraintreeComponent,
  BraintreeComponentOptions,
  BraintreeClient,
  Component,
  ComponentData,
} from "../types/braintree-sdk-metadata";

export type HooksConfiguration = {
  onComponentFunctionCall: (payload: Record<string, unknown>) => void;
  onClientMetadataAvailable: (payload: Record<string, unknown>) => void;
  onComponentAvailable: (payload: Record<string, unknown>) => void;
};

export default function generateProxiedComponent(
  data: ComponentData,
  hooks: HooksConfiguration
): BraintreeComponentEntryPoint {
  const { componentKey, componentInCamelCase, url, version } = data;
  return {
    create: (
      ...args: [
        BraintreeComponentOptions,
        Parameters<BraintreeComponentEntryPoint["create"]>[1]?
      ]
    ) => {
      window.braintreeDebugger.componentData[
        componentKey
      ].createArgs = args.map((arg) => {
        if (typeof arg === "function") {
          return "Function";
        }
        if (arg && arg.client) {
          return Object.assign({}, arg, { client: "<Client Instance>" });
        }

        return arg;
      }) as Component["createArgs"];

      // delete our fake version so the real script can load correctly
      delete window.braintree[componentInCamelCase];

      return loadScript({
        src: url + "?do-not-block=true",
      })
        .then(() => {
          return window.braintree[componentInCamelCase]
            .create(args[0])
            .then((instance: BraintreeComponent) => {
              return new Proxy(instance, {
                get(target, prop, receiver) {
                  const targetValue = Reflect.get(target, prop, receiver);

                  if (typeof targetValue === "function") {
                    return function (...functionArgs: unknown[]) {
                      hooks.onComponentFunctionCall({
                        componentKey,
                        functionName: prop,
                        args: functionArgs,
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
            let client: BraintreeClient;
            if (componentKey === "client") {
              client = (instance as unknown) as BraintreeClient;
            } else {
              client = (instance._clientPromise ||
                instance._client ||
                instance.client) as BraintreeClient;
            }
            if (client) {
              window.braintreeDebugger.metadataSent = true;
              Promise.resolve(client).then((client) => {
                hooks.onClientMetadataAvailable(client.getConfiguration());
              });
            }
          }
          const details = window.braintreeDebugger.componentData[componentKey];

          hooks.onComponentAvailable(details);

          if (typeof args[1] === "function") {
            args[1](null, instance);
          }

          return instance;
        })
        .catch((err) => {
          if (typeof args[1] === "function") {
            args[1](err);
          }

          return Promise.reject(err);
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
      // always false for now since venmo can't show up on desktop... yet
      return false;
    },
  };
}
