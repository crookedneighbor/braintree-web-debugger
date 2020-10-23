// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  const browser: FirefoxBrowserExtension;
}
type HeadersAddListener = (
  info: chrome.webRequest.WebResponseHeadersDetails
) => void;
type BeforeRequestAddListener = (
  details: chrome.webRequest.WebRequestDetails
) => void;
type Config = {
  urls: string[];
  types?: chrome.webRequest.ResourceType[];
};
type Permissions = string[];

// There is no easy @types/firefox module like there is for chrome
export interface FirefoxBrowserExtension {
  runtime: {
    openOptionsPage: () => void;
    getManifest: () => void;
    onInstalled: chrome.runtime.RuntimeInstalledEvent;
    getURL: (path: string) => string;
  };
  storage: {
    sync: {
      get: (args: string[]) => Promise<Record<string, unknown>>;
      set: (obj: Record<string, unknown>) => Promise<void>;
    };
  };
  webRequest: {
    onBeforeRequest: {
      addListener: (
        fn: BeforeRequestAddListener,
        config: Config,
        permissions: Permissions
      ) => void;
    };
    onHeadersReceived: {
      addListener: (
        fn: HeadersAddListener,
        config: Config,
        permissions: Permissions
      ) => void;
    };
  };
}

export interface OnHeadersReceivedOptions {
  addListener: HeadersAddListener;
  config: Config;
  permissions: Permissions;
}
export interface OnBeforeRequestOptions {
  addListener: BeforeRequestAddListener;
  config: Config;
  permissions: Permissions;
}
