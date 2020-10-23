import bus from "framebus";
import Modal from "./modal";
import BTLogoButton from "./bt-logo-button";

import type {
  Component,
  ComponentFunctionLog,
  ClientMetadata,
} from "../types/braintree-sdk-metadata";

const IGNORABLE_FUNCTIONS = {
  getConfiguration: true,
  getVersion: true,
  hasListener: true,
  toJSON: true,
};

export default async function start(): Promise<void> {
  let modal: Modal;
  let btLogo: BTLogoButton;

  function go() {
    if (modal) {
      return;
    }

    modal = new Modal();
    btLogo = new BTLogoButton({
      onClick() {
        modal.open();
      },
    });

    document.body.appendChild(btLogo.element);
    document.body.appendChild(modal.element);
  }

  bus.on("FAKE_BRAINTREE_READY", go);
  bus.emit("MAIN_EXTENSION_READY", {}, go);

  bus.on("CLIENT_METADATA", (data: ClientMetadata) => {
    modal.addClientMetadata(data);
    btLogo.reveal();
  });

  bus.on("COMPONENT_DETAILS", (data: Component) => {
    if (data.key === "client") {
      return;
    }
    modal.addComponent(data);
  });

  bus.on("COMPONENT_FUNCTION_CALL", (data: ComponentFunctionLog) => {
    if (
      String(data.functionName).charAt(0) !== "_" &&
      !(data.functionName in IGNORABLE_FUNCTIONS)
    ) {
      modal.logFunctionCall(data);
    }
  });
}

start();
