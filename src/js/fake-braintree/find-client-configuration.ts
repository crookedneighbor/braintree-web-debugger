import type {
  BraintreeClient,
  BraintreeComponent,
} from "../types/braintree-sdk-metadata";

export default function findClientConfiguration(
  componentKey: string,
  instance: BraintreeComponent
): Promise<Record<string, unknown>> {
  let client: BraintreeClient;

  if (componentKey === "client") {
    client = (instance as unknown) as BraintreeClient;
  } else {
    client = (instance._clientPromise ||
      instance._client ||
      instance.client) as BraintreeClient;
  }

  if (client) {
    return Promise.resolve(client).then((resolvedClient) => {
      return resolvedClient.getConfiguration();
    });
  }

  return Promise.reject(new Error("configuration not found"));
}
