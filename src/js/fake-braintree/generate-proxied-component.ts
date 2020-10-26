import findClientConfiguration from "./find-client-configuration";
import makeProxyComponent from "./make-proxy-component";

import type {
  BraintreeComponentEntryPoint,
  BraintreeComponentOptions,
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

      return makeProxyComponent(
        url,
        args[0],
        data,
        hooks.onComponentFunctionCall
      )
        .then((instance) => {
          if (
            !window.braintreeDebugger.metadataSent &&
            version.charAt(0) === "3"
          ) {
            findClientConfiguration(componentKey, instance)
              .then((config) => {
                window.braintreeDebugger.metadataSent = true;
                hooks.onClientMetadataAvailable(config);
              })
              .catch(() => {
                // ignore when configuration cannot be found
              });
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
