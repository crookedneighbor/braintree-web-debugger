import generateProxiedComponent, {
  HooksConfiguration,
} from "../generate-proxied-component";
import findClientConfiguration from "../find-client-configuration";
import { loadScript } from "@braintree/asset-loader";
import { mocked } from "ts-jest/utils";
import util from "util";

import type {
  BraintreeComponent,
  BraintreeDebuggerGlobal,
  ComponentData,
} from "../../types/braintree-sdk-metadata";

jest.mock("@braintree/asset-loader");
jest.mock("../find-client-configuration");

describe("generateProxiedComponent", () => {
  let data: ComponentData;
  let fakeHostedFields: BraintreeComponent;
  let hooks: HooksConfiguration;

  beforeEach(() => {
    hooks = {
      onComponentFunctionCall: jest.fn(),
      onClientMetadataAvailable: jest.fn(),
      onComponentAvailable: jest.fn(),
    };
    fakeHostedFields = {
      data: "foo",
      tokenize: jest.fn(),
      _client: {
        getConfiguration: jest.fn().mockReturnValue({
          foo: "bar",
        }),
      },
    };
    mocked(findClientConfiguration).mockImplementation(() => {
      return new Promise(() => {
        // noop
      });
    });
    mocked(loadScript).mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.braintree.hostedFields = {
        create: jest.fn().mockResolvedValue(fakeHostedFields),
        VERSION: "3.63.1",
      };

      return Promise.resolve(document.createElement("script"));
    });

    data = {
      url: "https://js.braintreegateway.com/web/3.63.1/js/hosted-fields.js",
      version: "3.63.1",
      semverVersion: {
        major: "3",
        minor: "63",
        patch: "1",
      },
      componentKey: "hosted-fields",
      componentInCamelCase: "hostedFields",
      componentName: "Hosted Fields",
      minified: false,
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.braintree = {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.braintreeDebugger = {
      metadataSent: false,
      componentData: {
        client: {},
        "hosted-fields": {},
      },
    } as BraintreeDebuggerGlobal;
  });

  it("returns an object with a create function", () => {
    const fakeComponent = generateProxiedComponent(data, hooks);

    expect(fakeComponent.create).toBeInstanceOf(Function);
  });

  it("returns an object with a version", () => {
    const fakeComponent = generateProxiedComponent(data, hooks);
    expect(fakeComponent.VERSION).toBe("3.63.1");
  });

  it("returns an object with stubs for boolean functions", () => {
    const fakeComponent = generateProxiedComponent(data, hooks);

    expect(fakeComponent.isSupported && fakeComponent.isSupported()).toBe(true);
    expect(
      fakeComponent.supportsInputFormatting &&
        fakeComponent.supportsInputFormatting()
    ).toBe(true);
    expect(
      fakeComponent.isBrowserSupported && fakeComponent.isBrowserSupported()
    ).toBe(false);
  });

  describe("create", () => {
    it("adds debugger data to window", () => {
      const fakeComponent = generateProxiedComponent(data, hooks);

      return fakeComponent
        .create({
          client: {
            getConfiguration: jest.fn(),
          },
          fields: "fields",
          styles: "styles",
        })
        .then(() => {
          expect(
            window.braintreeDebugger.componentData["hosted-fields"].createArgs
          ).toEqual([
            {
              client: "<Client Instance>",
              fields: "fields",
              styles: "styles",
            },
          ]);
        });
    });

    it("logs callback function", () => {
      const fakeComponent = generateProxiedComponent(data, hooks);

      return fakeComponent
        .create(
          {
            client: {
              getConfiguration: jest.fn(),
            },
            fields: "fields",
            styles: "styles",
          },
          () => {
            // noop
          }
        )
        .then(() => {
          expect(
            window.braintreeDebugger.componentData["hosted-fields"].createArgs
          ).toEqual([
            {
              client: "<Client Instance>",
              fields: "fields",
              styles: "styles",
            },
            "Function",
          ]);
        });
    });

    it("loads real script", () => {
      const fakeComponent = generateProxiedComponent(data, hooks);

      return fakeComponent.create({}).then(() => {
        expect(loadScript).toBeCalledTimes(1);
        expect(loadScript).toBeCalledWith({
          src:
            "https://js.braintreegateway.com/web/3.63.1/js/hosted-fields.js?do-not-block=true",
        });
      });
    });

    it("calls original create function with args", () => {
      const fakeComponent = generateProxiedComponent(data, hooks);
      const createArgs = {};

      return fakeComponent.create(createArgs).then(() => {
        expect(window.braintree.hostedFields.create).toBeCalledTimes(1);
        expect(window.braintree.hostedFields.create).toBeCalledWith(createArgs);
      });
    });

    it("does not pass callback directly to original create function", () => {
      const fakeComponent = generateProxiedComponent(data, hooks);
      const createArgs = {};
      const cb = jest.fn();

      return fakeComponent.create(createArgs, cb).then(() => {
        expect(window.braintree.hostedFields.create).toBeCalledTimes(1);
        expect(window.braintree.hostedFields.create).not.toBeCalledWith(
          createArgs,
          cb
        );
      });
    });

    it("resolves with the proxied component", () => {
      const fakeComponent = generateProxiedComponent(data, hooks);
      const createArgs = {};

      return fakeComponent.create(createArgs).then((instance) => {
        expect(util.types.isProxy(instance)).toBe(true);
        expect(instance.data).toBe("foo");
      });
    });

    it("rejects if underlying component rejects", () => {
      expect.assertions(1);
      const err = new Error("create error");

      mocked(loadScript).mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.braintree.hostedFields = {
          create: jest.fn().mockRejectedValue(err),
          VERSION: "3.63.1",
        };

        return Promise.resolve(document.createElement("script"));
      });

      const fakeComponent = generateProxiedComponent(data, hooks);

      return fakeComponent.create({}).catch((createError) => {
        expect(createError).toBe(err);
      });
    });

    it("passes proxied component to cb if provided", () => {
      const fakeComponent = generateProxiedComponent(data, hooks);
      const createArgs = {};
      const cb = jest.fn();

      return fakeComponent.create(createArgs, cb).then(() => {
        expect(cb).toBeCalledTimes(1);

        const instance = cb.mock.calls[0][1];
        expect(util.types.isProxy(instance)).toBe(true);
        expect(instance.data).toBe("foo");
      });
    });

    it("calls callback with error when create fails", () => {
      expect.assertions(2);
      const err = new Error("create error");

      mocked(loadScript).mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.braintree.hostedFields = {
          create: jest.fn().mockRejectedValue(err),
          VERSION: "3.63.1",
        };

        return Promise.resolve(document.createElement("script"));
      });

      const fakeComponent = generateProxiedComponent(data, hooks);
      const cb = jest.fn();

      return fakeComponent.create({}, cb).catch((createError) => {
        expect(err).toBe(createError);
        expect(cb).toBeCalledWith(createError);
      });
    });

    it("marks metadata as sent when client configuration is found", () => {
      const fakeConfig = { foo: "bar" };
      mocked(findClientConfiguration).mockResolvedValue(fakeConfig);
      const fakeComponent = generateProxiedComponent(data, hooks);

      expect(window.braintreeDebugger.metadataSent).toBe(false);

      return fakeComponent.create({}).then(() => {
        expect(window.braintreeDebugger.metadataSent).toBe(true);
      });
    });
  });

  it("calls onComponentFunctionCall hook when a function on proxied component is called", () => {
    const fakeComponent = generateProxiedComponent(data, hooks);

    expect(hooks.onComponentFunctionCall).not.toBeCalled();
    return fakeComponent.create({}).then((instance) => {
      expect(hooks.onComponentFunctionCall).not.toBeCalled();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      instance.tokenize("foo", "bar");
      expect(hooks.onComponentFunctionCall).toBeCalledTimes(1);
      expect(hooks.onComponentFunctionCall).toBeCalledWith({
        componentKey: "hosted-fields",
        functionName: "tokenize",
        args: ["foo", "bar"],
      });
    });
  });

  it("calls onClientMetadataAvailable hook when client is found for the first time", () => {
    const fakeConfig = { foo: "bar" };
    mocked(findClientConfiguration).mockResolvedValue(fakeConfig);

    const fakeComponent = generateProxiedComponent(data, hooks);

    expect(hooks.onClientMetadataAvailable).not.toBeCalled();

    return fakeComponent
      .create({})
      .then(() => {
        expect(hooks.onClientMetadataAvailable).toBeCalledTimes(1);
        expect(hooks.onClientMetadataAvailable).toBeCalledWith({
          foo: "bar",
        });

        return fakeComponent.create({});
      })
      .then(() => {
        expect(hooks.onClientMetadataAvailable).toBeCalledTimes(1);
      });
  });

  it("calls onComponentAvailable hook when component is created", () => {
    const fakeComponent = generateProxiedComponent(data, hooks);

    expect(hooks.onComponentAvailable).not.toBeCalled();

    return fakeComponent.create({ authorization: "auth" }).then(() => {
      expect(hooks.onComponentAvailable).toBeCalledTimes(1);
      expect(hooks.onComponentAvailable).toBeCalledWith({
        createArgs: [
          {
            authorization: "auth",
          },
        ],
      });
    });
  });

  it("calls onComponentAvailable hook with transformed client when present", () => {
    const fakeComponent = generateProxiedComponent(data, hooks);

    expect(hooks.onComponentAvailable).not.toBeCalled();

    return fakeComponent
      .create({ client: { getConfiguration: jest.fn() } })
      .then(() => {
        expect(hooks.onComponentAvailable).toBeCalledTimes(1);
        expect(hooks.onComponentAvailable).toBeCalledWith({
          createArgs: [
            {
              client: "<Client Instance>",
            },
          ],
        });
      });

    it("calls onComponentAvailable hook with transformed function if present", () => {
      const fakeComponent = generateProxiedComponent(data, hooks);

      expect(hooks.onComponentAvailable).not.toBeCalled();

      return fakeComponent
        .create({ authorization: "auth" }, jest.fn())
        .then(() => {
          expect(hooks.onComponentAvailable).toBeCalledTimes(1);
          expect(hooks.onComponentAvailable).toBeCalledWith({
            createArgs: [
              {
                authorization: "auth",
              },
              "Function",
            ],
          });
        });
    });
  });
});
