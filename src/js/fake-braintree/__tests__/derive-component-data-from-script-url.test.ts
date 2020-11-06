import deriveComponentDataFromScriptUrl from "../derive-component-data-from-script-url";

describe("deriveComponentDataFromScriptUrl", () => {
  it("pulls out metadata from v3 component url", () => {
    const url =
      "https://js.braintreegateway.com/web/3.63.1/js/hosted-fields.js";
    const data = deriveComponentDataFromScriptUrl(url);

    expect(data).toEqual({
      url,
      version: "3.63.1",
      componentKey: "hosted-fields",
      componentInCamelCase: "hostedFields",
      componentName: "Hosted Fields",
      minified: false,
    });
  });

  it("pulls out metadata from v1 dropin url", () => {
    const url =
      "https://js.braintreegateway.com/web/dropin/1.24.0/js/dropin.js";
    const data = deriveComponentDataFromScriptUrl(url);

    expect(data).toEqual({
      url,
      version: "1.24.0",
      componentKey: "dropin",
      componentInCamelCase: "dropin",
      componentName: "Drop-in",
      minified: false,
    });
  });

  it("handles minified urls", () => {
    const url =
      "https://js.braintreegateway.com/web/3.63.1/js/hosted-fields.min.js";
    const data = deriveComponentDataFromScriptUrl(url);

    expect(data).toEqual({
      url,
      version: "3.63.1",
      componentKey: "hosted-fields",
      componentInCamelCase: "hostedFields",
      componentName: "Hosted Fields",
      minified: true,
    });
  });

  it("provides nicer name for 3D Secure", () => {
    const url =
      "https://js.braintreegateway.com/web/3.63.1/js/three-d-secure.js";
    const data = deriveComponentDataFromScriptUrl(url);

    expect(data).toEqual({
      url,
      version: "3.63.1",
      componentKey: "three-d-secure",
      componentInCamelCase: "threeDSecure",
      componentName: "3D Secure",
      minified: false,
    });
  });
});
