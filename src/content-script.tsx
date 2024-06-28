import { createRoot } from "react-dom/client";
import { AppModal } from "./components/AppModal";
import { ModalLayout } from "./components/ModalLayout";

// @ts-ignore
import styleLight from "../dist/style-light.css" with { type: "text" };
// @ts-ignore
import styleDark from "../dist/style-dark.css" with { type: "text" };
import {
  isDarkModeEnabledInPrefs,
  setDarkModeEnabledInPrefs,
} from "./lib/content-script/dark-mode";
// biome-ignore lint/suspicious/noGlobalAssign: extension technical requirement to cross-reference
history = window.history;

// biome-ignore lint/suspicious/noGlobalAssign: extension technical requirement to cross-reference
document = window.document;

const fontGeistBold = chrome.runtime.getURL("fonts/Geist-Bold.woff2");
const fontGeistRegular = chrome.runtime.getURL("fonts/Geist-Regular.woff2");

class FtrElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
            <style>
                @font-face {
                    font-family: "GeistSans";
                    src: url("${fontGeistBold}") format("woff2");
                    font-weight: bold;
                    font-style: normal;
                    font-display: swap;
                }

                @font-face {
                    font-family: "GeistSans";
                    src: url("${fontGeistRegular}") format("woff2");
                    font-weight: normal;
                    font-style: normal;
                    font-display: swap;
                }
            </style>
            <div class="lm_ab ab-absolute ab-left-0 ab-top-0 ab-z-[2147483640]" id="ftr_root"></div>`;
    }
  }

  generateMatchingStyleElement(type: "dark" | "light") {
    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.setAttribute("data-theme", type);
    style.innerHTML = `
            ${type === "light" ? styleLight : styleDark}
        `;
    return style;
  }

  toggleStyleElement(type: "dark" | "light") {
    const style = this.shadowRoot?.querySelector(
      `style[type="text/css"][data-theme="${type}"]`,
    ) as HTMLStyleElement | null;
    if (style) {
      console.log("removeStyle");
      style.remove();
    }
    setDarkModeEnabledInPrefs(type === "dark");
    this.shadowRoot?.appendChild(this.generateMatchingStyleElement(type));
  }

  connectedCallback() {
    (async () => {
      if (this.shadowRoot) {
        // @ts-ignore
        window.__ftrShadowRoot = this.shadowRoot.getElementById("ftr_root")!;

        // @ts-ignore
        const root = createRoot(window.__ftrShadowRoot);
        this.toggleStyleElement(
          (await isDarkModeEnabledInPrefs()) ? "dark" : "light",
        );

        root.render(
          <>
            <AppModal root={this.shadowRoot}>
              <ModalLayout />
            </AppModal>
          </>,
        );
      }
    })();
  }

  static get observedAttributes() {
    return ["data-theme"];
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: "dark" | "light",
  ) {
    if (name === "data-theme") {
      this.updateTheme(newValue);
    }
  }

  updateTheme(theme: "dark" | "light") {
    this.toggleStyleElement(theme);
  }
}

customElements.define("ftr-root", FtrElement);

// Listen for changes to the 'dark' class on the <html> element
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "class") {
      const isDark = document.documentElement.classList.contains("ab-dark");
      document
        .querySelector("ftr-root")!
        .setAttribute("data-theme", isDark ? "dark" : "light");
    }
  });
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});

function init() {
  const ftrRoot = document.createElement("ftr-root");
  ftrRoot.setAttribute(
    "style",
    "display:flex; position: absolute; z-index: 2147483640",
  );
  document.body.appendChild(ftrRoot);

  /*
    const bodyPortal = document.createElement('div');
    bodyPortal.setAttribute('class', 'lm_ab ab-absolute ab-left-0 ab-top-0 ab-z-[2147483646]');
    document.body.appendChild(bodyPortal);

    console.log('init called', bodyPortal, fontGeistBold, fontGeistRegular)

    requestAnimationFrame(() => {

        const root = createRoot(bodyPortal); // createRoot(container!) if you use TypeScript
        root.render(<>
            {createPortal(
                <Style>{`
                    @font-face {
                        font-family: "GeistSans";
                        src: url("${fontGeistBold}") format("woff2");
                        font-weight: bold;
                        font-style: normal;
                        font-display: swap;
                    }
        
                    @font-face {
                        font-family: "GeistSans";
                        src: url("${fontGeistRegular}") format("woff2");
                        font-weight: normal;
                        font-style: normal;
                        font-display: swap;
                    }
                `}
                </Style>,
                document.head
            )}
            <AppModal>
                <ModalLayout />
            </AppModal>
        </>);
    })
    */
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
