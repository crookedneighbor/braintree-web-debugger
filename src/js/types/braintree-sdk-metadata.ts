// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  interface Window {
    braintree: Record<string, BraintreeComponentEntryPoint>;
    braintreeDebugger: BraintreeDebuggerGlobal;
  }
}

export type ComponentData = {
  url: string;
  version: string;
  semverVersion: {
    major: string;
    minor: string;
    patch: string;
  };
  componentKey: string;
  componentInCamelCase: string;
  componentName: string;
  minified: boolean;
};

export type BraintreeComponentEntryPoint = {
  create: (
    options: BraintreeComponentOptions,
    cb?: (err: Error | null, instance?: BraintreeComponent) => void
  ) => Promise<BraintreeComponent>;
  VERSION: string;
  isSupported?: () => boolean;
  supportsInputFormatting?: () => boolean;
  isBrowserSupported?: () => boolean;
};

export type BraintreeClient = {
  getConfiguration: () => ClientMetadata;
};

export type BraintreeComponentOptions = {
  client?: BraintreeClient;
  authorization?: string;
  [prop: string]: unknown;
};

export type BraintreeComponent = {
  [prop: string]: unknown;
  client?: BraintreeClient;
  _client?: BraintreeClient;
  _clientPromise?: Promise<BraintreeClient>;
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
    [prop: string]: unknown;
  };
};

export type BraintreeDebuggerGlobal = {
  metadataSent: boolean;
  componentData: {
    [prop: string]: Component;
  };
};
