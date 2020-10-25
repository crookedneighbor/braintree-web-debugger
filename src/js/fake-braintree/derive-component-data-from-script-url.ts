import type { ComponentData } from "../types/braintree-sdk-metadata";

const COMPONENT_NAME_MAP: Record<string, string> = {
  "three-d-secure": "3D Secure",
};

export default function deriveComponentDataFromScriptUrl(
  url: string
): ComponentData {
  const urlParts = url.split("/");
  const componentKey = urlParts
    .find((part) => part.indexOf(".js") > -1)
    ?.replace(/(.min)?.js/, "") as string;
  const version = urlParts.find((part) => part.indexOf("3.") > -1) as string;
  // https://hisk.io/javascript-snake-to-camel/
  const componentInCamelCase = componentKey.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );
  const componentName =
    componentKey in COMPONENT_NAME_MAP
      ? COMPONENT_NAME_MAP[componentKey]
      : componentKey
          .replace(/([-_][a-z])/g, (group) =>
            group.toUpperCase().replace("-", " ").replace("_", " ")
          )
          .replace(/^[a-z]/, (group) => group.toUpperCase());
  const minified = url.indexOf(".min.js") > -1;

  return {
    url,
    version,
    componentKey,
    componentInCamelCase,
    componentName,
    minified,
  };
}
