import createElement from "Lib/create-element";
import emptyElement from "Lib/empty-element";
import type {
  Component,
  ComponentFunctionLog,
  ClientMetadata,
} from "../types/braintree-sdk-metadata";

const AUTH_TYPES: Record<string, string> = {
  CLIENT_TOKEN: "Client Token",
  TOKENIZATION_KEY: "Tokenization Key",
};

export default class BraintreeDebuggerMoal {
  element: HTMLDivElement;

  private components: Record<string, Component>;

  private wrapper: HTMLDivElement;
  private componentsElement: HTMLUListElement;
  private metadataElement: HTMLDivElement;
  private mainContent: HTMLDivElement;
  private secondaryContainer: HTMLDivElement;
  private secondaryContent: HTMLDivElement;

  constructor() {
    this.element = document.createElement("div");
    this.element.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.innerText = this.createModalStyles();
    this.wrapper = this.makeModalElement();
    this.element.shadowRoot?.append(style, this.wrapper);

    this.componentsElement = this.wrapper.querySelector(
      ".braintree-web-debugger__modal-components"
    ) as HTMLUListElement;
    this.metadataElement = this.wrapper.querySelector(
      ".braintree-web-debugger__modal-metadata"
    ) as HTMLDivElement;
    this.mainContent = this.wrapper.querySelector(
      ".braintree-web-debugger__modal-main"
    ) as HTMLDivElement;
    this.secondaryContainer = this.wrapper.querySelector(
      ".braintree-web-debugger__modal-secondary-container"
    ) as HTMLDivElement;
    this.secondaryContent = this.wrapper.querySelector(
      ".braintree-web-debugger__modal-secondary-content"
    ) as HTMLDivElement;

    this.components = {};
  }

  open(): void {
    this.wrapper.classList.add("open");
  }

  close(): void {
    this.hideSecondaryContent();
    this.wrapper.classList.remove("open");
  }

  addClientMetadata(data: ClientMetadata): void {
    let merchantAccountId;
    const authorization = data.authorization;
    const authType = data.authorizationType;
    const niceAuthType = AUTH_TYPES[authType] || authType;
    const version = data.analyticsMetadata.sdkVersion;
    const merchantId = data.gatewayConfiguration.merchantId;

    if (authType === "CLIENT_TOKEN") {
      merchantAccountId = JSON.parse(atob(authorization)).merchantAccountId;
    }

    const metaElement = createElement(`<div>
      <p><strong>JS SDK Version:</strong> ${version}</p>
      <p><strong>Merchant ID:</strong> ${merchantId}</p>
      <p><strong>Merchant Account ID:</strong> ${
        merchantAccountId ? merchantAccountId : "Default"
      }</p>
      <p><strong>Authorization Type:</strong> ${niceAuthType}</p>
      <p><button>View Configuration</button></p>
    </div>`);

    metaElement.querySelector("button")?.addEventListener("click", () => {
      const view = createElement<HTMLDivElement>(`<div>
      <strong>${niceAuthType}:</strong>
      <pre><code>${authorization}</code></pre>
      <strong>Gateway Configuration:</strong>
      <pre><code>${JSON.stringify(
        data.gatewayConfiguration,
        null,
        2
      )}</code></pre>
      </div>`);
      this.revealSecondaryContent(view);
    });

    this.metadataElement.appendChild(metaElement);
  }

  addComponent(component: Component): void {
    const button = document.createElement("button");
    button.innerText = component.name;

    button.addEventListener("click", (e) => {
      e.preventDefault();

      const view = this.createComponentView(component.key);

      this.revealSecondaryContent(view);
    });

    this.componentsElement.appendChild(button);
    this.components[component.key] = component;
  }

  logFunctionCall(data: ComponentFunctionLog): void {
    const component = data.component;

    if (component === "client") {
      // no need to log client calls
      // usually just the underlying request
      // or a getConfiguration call
      return;
    }

    if (!this.components[component]) {
      console.error(
        "attempted to log a function call from",
        component,
        "but it was not found"
      );
      console.error(data);
      return;
    }

    const log = `${component}.${data.functionName}(${data.args
      .map((arg) => {
        if (arg === "Function") {
          return arg;
        }
        return JSON.stringify(arg, null, 2);
      })
      .join(", ")})`;
    this.components[component].log.push(log);
  }

  revealSecondaryContent(element: HTMLElement): void {
    emptyElement(this.secondaryContent);

    this.secondaryContent.appendChild(element);
    this.mainContent.classList.remove("active");
    this.secondaryContainer.classList.add("active");
  }

  hideSecondaryContent(): void {
    emptyElement(this.secondaryContent);

    this.mainContent.classList.add("active");
    this.secondaryContainer.classList.remove("active");
  }

  private formatCreateArgs(args: Component["createArgs"]): string {
    if (!args) {
      return "";
    }

    const stringified = JSON.stringify(args[0], null, 2);

    return stringified.replace('"<Client Instance>"', "Client Instance");
  }

  private createComponentView(componentName: string): HTMLDivElement {
    const component = this.components[componentName];
    const logs =
      component.log.length > 0
        ? component.log.join("\n")
        : "No function call logs found.";
    const element = createElement<HTMLDivElement>(`<div>
      <h2>${componentName}</h2>

      <h3>Create Args</h3>
      <p>Uses ${
        component.createArgs && component.createArgs[1] === "Function"
          ? "callback function"
          : "Promise"
      } to create component</p>
      <pre><code>${this.formatCreateArgs(component.createArgs)}</code></pre>

      <h3>Function Call Logs</h3>
      <pre><code>${logs}</code></pre>
    </div>`);

    return element;
  }

  private createModalStyles(): string {
    return `
      .braintree-web-debugger__modal-outer-container {
        display: none;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        min-height: 100vh;
        z-index: 99999999999;
        animation: 0.5s appear;
      }

      .braintree-web-debugger__modal-background {
        z-index: 1;
        background: rgba(0, 0, 0, 0.7);
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }

      .braintree-web-debugger__modal-outer-container.open {
        display: flex;
        justify-content: center;
        align-items: center;
        animation: .5s drop;
      }

      .braintree-web-debugger__modal-container {
        z-index: 10;
        background: white;
        padding: 10px;
        border-radius: 5px;
        width: 500px;
        max-width: 100%;
        min-height: 50px;
        max-height: 70%;
        overflow-y: auto;
      }
      .braintree-web-debugger__modal-container pre {
        background: lightgray;
        padding: 20px;
        border-radius: 5px;
        overflow: auto;
        max-height: 300px;
      }

      .braintree-web-debugger__modal-container button {
        cursor: pointer;
        background: black;
        border: none;
        border-radius: 5px;
        color: white;
        padding: 15px 32px;
        margin: 5px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
      }

      .braintree-web-debugger__modal-container button:hover {
        background: #383838;
      }

      .braintree-web-debugger__modal-container button:firt-child {
        margin-left: 0;
      }

      .braintree-web-debugger__modal-container p {
        margin: 4px;
      }

      .braintree-web-debugger__modal-container pre code {
        overflow-x: scroll;
      }

      .braintree-web-debugger__modal-main, .braintree-web-debugger__modal-secondary-container {
        display: none;
      }

      .braintree-web-debugger__modal-main.active, .braintree-web-debugger__modal-secondary-container.active {
        display: block;
      }

      @keyframes appear {
        from {
          opacity: 0;
        }
      }

      @keyframes drop {
        from {
          margin-top: -2%;
        }
      }
  `;
  }

  private makeModalElement(): HTMLDivElement {
    const modal = createElement<HTMLDivElement>(`<div class="braintree-web-debugger__modal-outer-container">
  <div class="braintree-web-debugger__modal-container">
    <div class="braintree-web-debugger__modal-main active">
      <div class="braintree-web-debugger__modal-metadata"></div>
      <p><strong>Braintree Components on the Page:</strong></p>
      <div class="braintree-web-debugger__modal-components"></div>
    </div>
    <div class="braintree-web-debugger__modal-secondary-container">
      <div class="braintree-web-debugger__modal-secondary-content"></div>
      <button class="braintree-web-debugger__modal-secondary-back-link">Back</button>
    </div>
  </div>
  <div class="braintree-web-debugger__modal-background"></div>
</div>`);

    modal
      .querySelector(".braintree-web-debugger__modal-background")
      ?.addEventListener("click", () => {
        this.close();
      });
    modal
      .querySelector(".braintree-web-debugger__modal-secondary-back-link")
      ?.addEventListener("click", () => {
        this.hideSecondaryContent();
      });

    document.addEventListener("keydown", (evt) => {
      evt = evt || window.event;

      if (evt.keyCode == 27) {
        this.close();
      }
    });

    return modal;
  }
}
