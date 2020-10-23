export type BraintreeComponent = {
  [prop: string]: unknown;
  client: string;
};
export type Component = {
  key: string;
  name: string;
  nameInCamelCase: string;
  version: string;
  minified: boolean;
  createArgs?: [BraintreeComponent, "Function"];
  // Really, this can be any Braintree sdk component instance
  instance?: BraintreeComponent;
  log: string[];
};

export type ComponentFunctionLog = {
  component: string;
  functionName: string;
  args: unknown[];
};

export type ClientMetadata = {
  analyticsMetadata: {
    sdkVersion: string;
  };
  authorization: string;
  authorizationType: string;
  gatewayConfiguration: {
    merchantId: string;
  };
};
