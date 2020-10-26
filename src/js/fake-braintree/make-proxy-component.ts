import { loadScript } from "@braintree/asset-loader";

import type {
  BraintreeComponent,
  ComponentData,
  BraintreeComponentOptions,
} from "../types/braintree-sdk-metadata";

type OnComponentFunctionCallHandler = (
  payload: Record<string, unknown>
) => void;

export default function makeProxyComponent(
  url: string,
  createConfig: BraintreeComponentOptions,
  data: ComponentData,
  onComponentFunctionCall: OnComponentFunctionCallHandler
): Promise<BraintreeComponent> {
  return loadScript({
    src: url + "?do-not-block=true",
  })
    .then(() => {
      return window.braintree[data.componentInCamelCase].create(createConfig);
    })
    .then((instance: BraintreeComponent) => {
      return proxyifyComponent(
        data.componentKey,
        instance,
        onComponentFunctionCall
      );
    });
}

function proxyifyComponent(
  componentKey: string,
  instance: BraintreeComponent,
  onComponentFunctionCall: OnComponentFunctionCallHandler
): BraintreeComponent {
  return new Proxy(instance, {
    get(target, prop, receiver) {
      const targetValue = Reflect.get(target, prop, receiver);

      if (typeof targetValue === "function") {
        return function (...functionArgs: unknown[]) {
          onComponentFunctionCall({
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
}
