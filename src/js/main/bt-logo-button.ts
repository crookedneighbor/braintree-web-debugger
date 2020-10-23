import { getURL } from "Browser/runtime";

const BRAINTREE_WEB_DEBUGGER_LOGO = getURL("braintree-logo.jpg");

export default class BTLogoButton {
  element: HTMLDivElement;
  private wrapper: HTMLDivElement;

  constructor(options: { onClick: () => void }) {
    this.element = document.createElement("div");
    this.element.attachShadow({ mode: "open" });
    this.wrapper = this.makeElement();
    this.element.shadowRoot?.append(this.createStyle(), this.wrapper);

    this.wrapper.addEventListener("click", () => {
      this.open();

      options.onClick();
    });
  }

  open(): void {
    this.wrapper.classList.add("open");
  }

  reveal(): void {
    this.wrapper.classList.remove("hide");
  }

  private makeElement() {
    const div = document.createElement("div");
    const img = document.createElement("img");

    div.classList.add("braintree-web-debugger__icon-container", "hide");
    img.src = BRAINTREE_WEB_DEBUGGER_LOGO;

    div.appendChild(img);

    return div;
  }

  private createStyle(): HTMLStyleElement {
    const style = document.createElement("style");
    style.innerText = `
      .braintree-web-debugger__icon-container {
        position: fixed;
        right: 35px;
        bottom: 15px;
        width: 30px;
        cursor: pointer;
        animation: 1s appear, 1s drop;
      }

      .braintree-web-debugger__icon-container.hide {
        display: none;
      }

      .braintree-web-debugger__icon-container img {
        max-width: 100%;
        border-radius: 5px;
        animation-name: bounce;
        animation-timing-function: ease;
        transform-origin: bottom;
        animation-duration: 2s;
        animation-iteration-count: infinite;
      }

      .braintree-web-debugger__icon-container.open img {
        animation: none;
      }

      @keyframes appear {
        from {
          opacity: 0;
        }
      }

      @keyframes drop {
        from {
          bottom: 30px;
        }
      }

      @keyframes bounce {
        0%   { transform: scale(1,1)      translateY(0); }
        10%  { transform: scale(1.1,.9)   translateY(0); }
        30%  { transform: scale(.9,1.1)   translateY(-20px); }
        50%  { transform: scale(1.05,.95) translateY(0); }
        57%  { transform: scale(1,1)      translateY(-3px); }
        64%  { transform: scale(1,1)      translateY(0); }
        100% { transform: scale(1,1)      translateY(0); }
      }
    `;

    return style;
  }
}
