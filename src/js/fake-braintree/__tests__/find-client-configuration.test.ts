import findClientConfiguration from "../find-client-configuration";

import type { BraintreeClient } from "../../types/braintree-sdk-metadata";

describe("findClientConfiguration", () => {
  let client: BraintreeClient;

  beforeEach(() => {
    client = {
      getConfiguration: jest.fn().mockReturnValue({ foo: "bar" }),
    };
  });

  it("resolves with configuration when component is a client", () => {
    return findClientConfiguration("client", client).then((config) => {
      expect(config).toEqual({ foo: "bar" });
    });
  });

  it("resolves with configuration when component has a _clientPromise property", () => {
    const instance = {
      _clientPromise: Promise.resolve(client),
    };

    return findClientConfiguration("not-client", instance).then((config) => {
      expect(config).toEqual({ foo: "bar" });
    });
  });

  it("resolves with configuration when component has a _client property", () => {
    const instance = {
      _client: client,
    };

    return findClientConfiguration("not-client", instance).then((config) => {
      expect(config).toEqual({ foo: "bar" });
    });
  });

  it("resolves with configuration when component has a client property", () => {
    const instance = {
      client,
    };

    return findClientConfiguration("not-client", instance).then((config) => {
      expect(config).toEqual({ foo: "bar" });
    });
  });

  it("rejects if configuration cannot be found", () => {
    expect.assertions(1);

    return findClientConfiguration("not-client", {}).catch((err) => {
      expect(err.message).toBe("configuration not found");
    });
  });
});
