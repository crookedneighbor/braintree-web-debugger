import Framebus from "framebus";
import deriveComponentDataFromScriptUrl from "./derive-component-data-from-script-url";
import generateProxiedComponent from "./generate-proxied-component";

const bus = new Framebus();

export default function start(): void {
  bus.emit("FAKE_BRAINTREE_READY");
  bus.on("MAIN_EXTENSION_READY", (data, reply) => {
    reply({});
  });

  const myself = document.currentScript as HTMLScriptElement;
  const originalSrc = myself.src;
  const componentData = deriveComponentDataFromScriptUrl(originalSrc);
  const {
    version,
    componentKey,
    componentInCamelCase,
    componentName,
    minified,
  } = componentData;
  const braintree = (window.braintree = window.braintree || {});
  const braintreeDebugger = (window.braintreeDebugger = window.braintreeDebugger || {
    metadataSent: false,
    componentData: {},
  });

  braintreeDebugger.componentData[componentKey] = {
    key: componentKey,
    name: componentName,
    nameInCamelCase: componentInCamelCase,
    version,
    minified,
    log: [],
  };

  braintree[componentInCamelCase] = generateProxiedComponent(componentData, {
    onComponentFunctionCall(payload) {
      bus.emit("COMPONENT_FUNCTION_CALL", {
        component: payload.componentKey,
        functionName: payload.functionName,
        args: (payload.args as unknown[]).map((arg) => {
          if (typeof arg === "function") {
            return "Function";
          }

          return arg;
        }),
      });
    },
    onClientMetadataAvailable(config) {
      bus.emit("CLIENT_METADATA", config);
    },
    onComponentAvailable(details) {
      bus.emit("COMPONENT_DETAILS", details);
    },
  });
}
