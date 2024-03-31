import { createRoot } from 'react-dom/client';
import { AppModal } from './components/AppModal';
import { ModalLayout } from './components/ModalLayout';

// @ts-ignore
import styleLight from "../dist/style-light.css" with {type: "text"};
// @ts-ignore
import styleDark from "../dist/style-dark.css" with {type: "text"};
import { isDarkModeEnabledInPrefs, setDarkModeEnabledInPrefs } from './lib/content-script/dark-mode';

history = window.history
document = window.document

const fontGeistBold = chrome.runtime.getURL('fonts/Geist-Bold.woff2')
const fontGeistRegular = chrome.runtime.getURL('fonts/Geist-Regular.woff2')

class FtrElement extends HTMLElement {
    constructor() {
      super(); 

      this.attachShadow({ mode: 'open' });

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

                :host {
                    font-size: 10px;
                    padding: 0;
                    margin: 0;
                }
            </style>
            <div class="lm_ab ab-absolute ab-left-0 ab-top-0 ab-z-[2147483646]" id="ftr_root"></div>`;
        }
    }

    generateMatchingStyleElement(type: 'dark' | 'light') {
        const style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.setAttribute('data-theme', type);
        style.innerHTML = `
            ${type === 'light' ? styleLight : styleDark}
        `;
        return style;
    }

    toggleStyleElement(type: 'dark' | 'light') {
        const style = this.shadowRoot?.querySelector(`style[type="text/css"][data-theme="${type}"]`) as HTMLStyleElement | null;
        if (style) {
            console.log("removeStyle")
            style.remove();
        }
        setDarkModeEnabledInPrefs(type === 'dark');
        this.shadowRoot?.appendChild(this.generateMatchingStyleElement(type));
    }

    connectedCallback() {

        (async() => {

            if (this.shadowRoot) {
                const root = createRoot(this.shadowRoot.getElementById("ftr_root")!); 
                this.toggleStyleElement(await isDarkModeEnabledInPrefs() ? 'dark' : 'light');

                root.render(<>
                    <AppModal>
                        <ModalLayout />
                    </AppModal>
                </>);
            }
        })()
    }

    static get observedAttributes() { return ['data-theme']; }

    attributeChangedCallback(name: string, oldValue: string, newValue: 'dark' | 'light') {
        if (name === 'data-theme') {
            this.updateTheme(newValue);
        }
    }

    updateTheme(theme: 'dark' | 'light') {
        this.toggleStyleElement(theme);
    }
}

customElements.define('ftr-root', FtrElement);

// Listen for changes to the 'dark' class on the <html> element
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const isDark = document.documentElement.classList.contains('ab-dark');
        document.querySelector('ftr-root')!.setAttribute('data-theme', isDark ? 'dark' : 'light');
      }
    });
  });

observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
});

function init() {
    const ftrRoot = document.createElement('ftr-root');
    ftrRoot.setAttribute('style', 'display:flex; position: absolute; z-index: 2147483646');
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
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

/*
import EasyMDE from "easymde"
// @ts-ignore
import TurndownService from 'turndown/lib/turndown.browser.umd'
// @ts-ignore
import { gfm, strikethrough, tables, taskListItems } from 'turndown-plugin-gfm/lib/turndown-plugin-gfm.browser.es'

(() => {

    const turndownService = new TurndownService()
    turndownService.use([gfm, tables, strikethrough, taskListItems, tables])

    turndownService.addRule('h1', {
        filter: ['h1'],
        replacement: (content: string) => '\n# ' + content + '\n'
    })

    turndownService.addRule('h2', {
        filter: ['h2'],
        replacement: (content: string) => '\n## ' + content + '\n'
    })

    turndownService.addRule('h3', {
        filter: ['h3'],
        replacement: (content: string) => '\n### ' + content + '\n'
    })

    turndownService.addRule('h4', {
        filter: ['h4'],
        replacement: (content: string) => '\n#### ' + content + '\n'
    })

    turndownService.addRule('h5', {
        filter: ['h5'],
        replacement: (content: string) => '\n##### ' + content + '\n'
    })

    turndownService.addRule('h6', {
        filter: ['h6'],
        replacement: (content: string) => '\n##### ' + content + '\n'
    })

    turndownService.addRule('scripting', {
        filter: ['script', 'code', 'style'],
        replacement: (content: string) => ''
    })


    const headerButtonStyle = `
        display: flex;
        font-size: 16px;
        border-radius: 5px;
        padding: 5px; 
        border: none; 
        outline: none; 
        cursor: pointer;
        background: #333;
        color: white;
        font-weight: bold;
    `;

    const tabButtonStyle = `
        width: 100%; 
        border-radius: 5px 5px 0 0;
        padding: 5px; 
        border: none; 
        outline: none; 
        cursor: pointer;
        color: white;
        font-weight: bold;
    `;

    let easyMde: EasyMDE;
    let lastSelection = null;
    let lastSelectedText: string = "";
    let lastAnchorNode: Node;
    let actionButtonRef: HTMLElement;
    let modalOpenerPositionX = 10;
    let modalOpenerPositionY = 10;
    let modalPositionX = 60;
    let modalPositionY = 60;
    let modal: HTMLElement;
    let modalContent: HTMLElement;
    let modalSettings: HTMLElement;
    let modalPromptText: HTMLTextAreaElement;
    let modalResultText: HTMLTextAreaElement;
    let modalInputText: HTMLTextAreaElement;
    let isSettingsOpen = false;
    let websiteText = ""
    let activePrompt: "translate" | "summarize" | "grammar" | "rephrase" | "archive" | "transcribe" = "translate"

    const iconSvg = (width = 40, height = 40) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0 0 12 22"/><path d="M7 8.517h5m5 0h-1.786m-3.214 0h3.214m-3.214 0V7m3.214 1.517c-.586 2.075-1.813 4.037-3.214 5.76M8.429 18C9.56 16.97 10.84 15.705 12 14.277m0 0c-.714-.829-1.714-2.17-2-2.777m2 2.777l2.143 2.206"/></g></svg>`

    const debounce = (fn: Function, ms: number) => {
        let timeout: Timer;

        return function () {
            const delegate = () => fn.apply(
            // @ts-ignore
            this, arguments);

            clearTimeout(timeout);
            timeout = setTimeout(delegate, ms);
        }
    }

    function copyToClipboard(text: string) {

        // Create a temporary text area to copy the text
        let textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        
        // Select and copy the text to the clipboard
        textarea.select();
        document.execCommand('copy');
        
        // Remove the temporary text area
        document.body.removeChild(textarea);
    }

    function addActionButton() {

        // Create the button element
        let modalOpener = document.createElement('button');
        modalOpener.innerHTML = iconSvg();

        // Initial draggable setup
        let isDragging = false;
        let startX: number, startY: number;

        // Convert mouse position to 'right' and 'top' coordinates
        const updatePosition = (e: MouseEvent) => {
            const dx = startX - e.clientX;
            const dy = startY - e.clientY;
            const currentRight = parseInt(window.getComputedStyle(modalOpener).right, 10);
            const currentTop = parseInt(window.getComputedStyle(modalOpener).top, 10);

            modalOpenerPositionX = currentRight + dx
            modalOpenerPositionY = currentTop - dy

            modalOpener.style.right = `${modalOpenerPositionX}px`;
            modalOpener.style.top = `${modalOpenerPositionY}px`;

            startX = e.clientX;
            startY = e.clientY;
        };

        // Mouse down event
        modalOpener.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            modalOpener.style.opacity = '0.8'; // Optional: Change opacity to indicate dragging
            document.addEventListener('mousemove', updatePosition, false);
        });

        // Mouse up event to finalize the drag
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                modalOpener.style.opacity = '0.95'; // Reset opacity after dragging
                isDragging = false;
                document.removeEventListener('mousemove', updatePosition, false);
            }
        });

        // when translate is clicked, send a message to the background script
        modalOpener.addEventListener('click', (evt) => {

            console.log('lastSelectedText', lastSelectedText);

            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
            } else {

                updateModal('selection-change');
                modal.style.display = 'flex';
            }
        });

        // Style the button to position at the top-right corner of the image
        modalOpener.style.position = 'fixed';
        modalOpener.style.display = 'block';
        modalOpener.style.width = '40px';
        modalOpener.style.height = '40px';
        modalOpener.style.top = `${modalOpenerPositionY}px`;
        modalOpener.style.right =`${modalOpenerPositionX}px`;
        modalOpener.style.background = 'black';
        modalOpener.style.color = 'white';
        modalOpener.style.border = 'none';
        modalOpener.style.borderRadius = '50px';
        modalOpener.style.cursor = 'pointer';
        modalOpener.style.zIndex = '1000000';
        modalOpener.style.fontSize = '2em';
        modalOpener.style.opacity = '0.95';
        modalOpener.style.padding = '0px';
        modalOpener.style.margin = '0px';

        // Append the button as a child of the image's parent element
        document.body.appendChild(modalOpener);

        return modalOpener;
    }

    function removeActionButton(actionButtonRef: HTMLElement) {
        if (actionButtonRef && actionButtonRef.parentNode) {
            actionButtonRef.parentNode.removeChild(actionButtonRef);
        }
    }

    function getAnchorNode(selection: Selection) {
        let anchorNode = selection.anchorNode;
    
        // If the anchorNode is a text node, get its parent element
        if (anchorNode && anchorNode.nodeType === Node.TEXT_NODE) {
            return anchorNode.parentNode as Node;
        }
        return anchorNode as Node
    }

    function getClosestWrappingElement(): Element | null {
        const selection = window.getSelection()!;
        if (!selection.rangeCount) return null; // No selection
      
        const range = selection.getRangeAt(0);
        const commonAncestor = range.commonAncestorContainer;
      
        // If the commonAncestor is an element, return it directly
        if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
          return commonAncestor as Element;
        }
        
        // Otherwise, return the parent element of the text node
        return commonAncestor.parentNode as Element;
    }

    function updateSelectedText() {
        
        removeActionButton(actionButtonRef);

        lastSelection = window.getSelection()!;
        const closestWrappingElement = getClosestWrappingElement();
        lastAnchorNode = getAnchorNode(lastSelection);

        if (modal.contains(lastAnchorNode)) {
            return;
        }

        if (closestWrappingElement && closestWrappingElement.innerHTML) {
            lastSelectedText = turndownService.turndown(closestWrappingElement.innerHTML)
        } else {

            if (!lastSelection || lastSelection.rangeCount === 0 || lastSelection.toString().trim() === "") return;

            lastSelectedText = lastSelection.toString();
        }
        if(!lastSelectedText.trim()) return;

        actionButtonRef = addActionButton();
    }

    async function setValue(key: string, value: any) {

        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({action: "set", text: JSON.stringify({key, value})}, (response) => {
                if (response.success) {
                    console.log('value was set', key, value, response);
                    resolve(key);
                } else {
                    reject('value was not set for key: ' + key)
                }
            });
        });
    }

    async function getValue(key: string) {

        return new Promise((resolve, reject) => {

            chrome.runtime.sendMessage({action: "get", text: JSON.stringify({ key })}, (response) => {
                
                if (response.success) {
                    const value = JSON.parse(response.value)
                    console.log('got value for', key, 'value', value);
                    resolve(value)
                } else {
                    reject('could not get value for key: ' + key);
                }
            });
        })
    }

    async function createModal() {

        const urlFontAwesomeWebFontWoff = chrome.runtime.getURL('webfonts/font-awesome-webfont.woff2')
        const newFontStyleSheet = document.createElement("style");
        newFontStyleSheet.setAttribute('type', 'text/css');
        newFontStyleSheet.textContent = `
        @font-face {
            font-family: 'FontAwesome';
            src: url(${urlFontAwesomeWebFontWoff});
            font-weight: normal;
            font-style: normal; 
        }
        `;
        document.head.appendChild(newFontStyleSheet);


        // Create the button element
        modal = document.createElement('div');
        modal.setAttribute('class', '__languageMagicModal');
        modal.innerHTML = `
            <div id="$$_languageMagicModalHeader" style="
                display:flex;
                cursor: grab;
                font-weight: bold;
                border-radius: 5px 5px 0 0;
                justify-content: space-between;
                align-items: center;
                padding-left: 5px;
                padding-right: 5px;
                background: #333;
                color: #fff;
            ">
                <span style="
                    width: 100%; 
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                ">${iconSvg(24, 24)} <span style="margin-left: 5px;">FTR Tools</span></span>

                <button style="${headerButtonStyle}" id="$$_languageMagicModalSettingsButton">⚙️</button>
                <button style="${headerButtonStyle}" id="$$_languageMagicModalCloseButton">✕</button>
            </div>
            
            <div id="$$_languageMagicModalSettings" style="
                display: ${isSettingsOpen ? 'flex' : 'none'};;
                flex-direction: column;
            ">
                <div style="
                    display: flex;
                    flex: 1;
                    flex-direction: row;
                    padding: 5px;   
                ">
                    <label for="$$_languageMagicModalApiKey" style="
                        font-size: 14px;
                        flex: 1;
                        padding: 5px;
                        font-weight: bold;
                    ">OpenAI API Key:</label>
                    <input type="text" placeholder="OpenAI API Key" id="$$_languageMagicModalApiKey" style="
                        padding: 5px; 
                        width: 100%;
                        border: 1px solid #333;
                        flex: 3;
                        width: 100%; 
                        outline: none; 
                        background: transparent;
                    " value="${await getValue('openAiApiKey')}" />
                </div>
            </div>

            <div id="$$_languageMagicModalContent" style="
                display: ${isSettingsOpen ? 'none' : 'flex'};
                flex-direction: column;
                height: 100%;
                flex: 1;
            ">
                <div style="
                    display: flex;
                    flex-direction: column;
                ">
                    <div style="
                    margin-top: 5px;
                        display: flex;
                        flex-direction: row;
                    ">
                        <button id="$$_languageMagicModalTranslatePromptButton" style="
                            ${tabButtonStyle}
                            background: ${activePrompt === "translate" ? "#555" : "#333"};
                        ">Translate</button>

                        <button id="$$_languageMagicModalGrammarPromptButton" style="
                            ${tabButtonStyle}
                            background: ${activePrompt === "grammar" ? "#555" : "#333"};
                        ">Fix</button>

                        <button id="$$_languageMagicModalRephrasePromptButton" style="
                            ${tabButtonStyle}
                            background: ${activePrompt === "rephrase" ? "#555" : "#333"};
                        ">Rephrase</button>

                        <button id="$$_languageMagicModalSummarizePromptButton" style="
                            ${tabButtonStyle}
                            background: ${activePrompt === "summarize" ? "#555" : "#333"};
                        ">Summarize</button>

                        <button id="$$_languageMagicModalTranscribePromptButton" style="
                            ${tabButtonStyle}
                            background: ${activePrompt === "transcribe" ? "#555" : "#333"};
                        ">Transcribe</button>

                        <button id="$$_languageMagicModalArchiveButton" style="
                            ${tabButtonStyle}
                            background: ${activePrompt === "archive" ? "#555" : "#333"};
                        ">Archive</button>
                    </div>
                
                    <textarea placeholder="Text to process..." id="$$_languageMagicModalInputText"></textarea>

                   
                </div>
                <div style="
                    display: flex;
                    flex: 1;
                ">
                    <div style="
                        flex: 1;
                        flex-direction: column;
                        display: flex;
                    ">
                        <span style="
                            font-weight: bold;
                            font-size: 14px;
                            padding: 0px;
                            padding-left: 5px;
                        ">Prompt:</span>
                        <textarea id="$$_languageMagicModalPromptText" style="
                            padding-top: 0px;
                            height: 100%;
                        "></textarea>
                    </div>
                    <div style="
                        width: 40px;
                        margin: 5px;
                        flex-direction: column;
                        display: flex;
                        align-items: center;
                        text-align: center;
                        justify-content: space-between;
                    ">
                        <button id="$$_languageMagicModalStartButton" style="
                            margin: 5px;
                            width: 100%; 
                            border-radius: 5px;
                            padding: 5px; 
                            border: none; 
                            outline: none; 
                            cursor: pointer;
                            background: #333;
                            color: white;
                            font-weight: bold;
                        ">Run ➡️ </button>

                        <span id="$$_languageMagicModalTokensUsed" style="
                            font-size: 12px;
                        ">
                            <b>Tokens used:</b><br />
                            0
                            
                            <br /><br />

                            <b>Price:</b><br />
                            
                            ~0.00$
                        </span>

                    </div>
                    <div style="
                        flex: 1;
                        flex-direction: column;
                        display: flex;
                        position: relative;
                    ">
                        <span style="
                            font-weight: bold;
                            font-size: 14px;
                            padding: 0px;
                            padding-left: 5px;
                        ">Result:</span>
                        <textarea readonly id="$$_languageMagicModalResultText" style="
                            padding-top: 0px;
                            height: 100%;
                        "></textarea>


                        <button id="$$_languageMagicModalCopyButton" style=" 
                            width: 40px;
                            height: 40px;
                            line-height: 24px;
                            border-radius: 5px;
                            padding: 5px;
                            position: absolute;
                            display: block;
                            bottom: 5px;
                            right: 5px;
                            border: none;
                            outline: none;
                            cursor: pointer;
                            font-size: 30px;
                            background: #333;
                            color: white;
                            font-weight: bold;
                        ">&#x2398;</button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.position = 'fixed';
        modal.style.display = 'none';
        modal.style.width = '75vw';
        modal.style.minHeight = '75vh';
        modal.style.padding = '5px';
        modal.style.border = '2px solid #333';
        modal.style.borderRadius = '5px';
        modal.style.top = `${modalPositionY}px`;
        modal.style.right =`${modalPositionX}px`;
        modal.style.background = '#eee';
        modal.style.color = '#111'
        modal.style.zIndex = '1000001';
        modal.style.flexDirection = 'column';
        modal.style.opacity = '0.95';

        document.body.appendChild(modal);

        // Initial draggable setup
        let isDragging = false;
        let startX: number, startY: number;

        requestAnimationFrame(() => {

            const modalHeader = document.getElementById('$$_languageMagicModalHeader')!;
            const modalCloseButton = document.getElementById('$$_languageMagicModalCloseButton')!;
            const modalSettingsButton = document.getElementById('$$_languageMagicModalSettingsButton')!;
            const modalTranslatePromptButton = document.getElementById('$$_languageMagicModalTranslatePromptButton')!;
            const modalSummarizePromptButton = document.getElementById('$$_languageMagicModalSummarizePromptButton')!;  
            const modalFixGrammarPromptButton = document.getElementById('$$_languageMagicModalGrammarPromptButton')!;
            const modalArchiveButton = document.getElementById('$$_languageMagicModalArchiveButton')!;
            const modalCreativeWritingPromptButton = document.getElementById('$$_languageMagicModalRephrasePromptButton')!;
            const modalStartButton = document.getElementById('$$_languageMagicModalStartButton')!;
            const openApiKey = document.getElementById('$$_languageMagicModalApiKey')! as HTMLInputElement;

            modalContent = document.getElementById('$$_languageMagicModalContent')!;
            modalSettings = document.getElementById('$$_languageMagicModalSettings')!;
            modalInputText = document.getElementById('$$_languageMagicModalInputText')! as HTMLTextAreaElement;
            modalResultText = document.getElementById('$$_languageMagicModalResultText')! as HTMLTextAreaElement;
            modalPromptText = document.getElementById('$$_languageMagicModalPromptText')! as HTMLTextAreaElement;

            easyMde = new EasyMDE({
                element: modalInputText, 
                spellChecker: false,
                autofocus: true,
                autoDownloadFontAwesome: false,
                status: false,
                maxHeight: '150px',
                //forceSync: true,
            });

            easyMde.codemirror.on("change", () => {
                console.log('change', easyMde.value());
                lastSelectedText = easyMde.value();
                generatePrompt();
            });

            openApiKey.addEventListener('change', (evt) => {
                console.log('openApiKey changed', openApiKey.value);
                setValue('openAiApiKey', openApiKey.value);
            });

            modalSettingsButton.addEventListener('click', (evt) => {
                isSettingsOpen = !isSettingsOpen;

                console.log('settings clicked');

                updateModal('mode-change');
            });

            modalStartButton.addEventListener('click', (evt) => {

                modalStartButton.setAttribute('disabled', 'true');
                modalStartButton.style.opacity = "0.5";

                //const markdown = easyMde.value();
                const prompt = modalPromptText.value;

                const updateStream = setInterval(async() => {
                    try {
                        modalResultText.value = await getValue('partialResponseText') as string;
                    } catch (error) {
                        // ignore
                    }
                }, 500)

                chrome.runtime.sendMessage({action: "prompt", text: JSON.stringify({
                    openApiKey: openApiKey.value,
                    prompt: prompt,
                })}, (response) => {

                    const resultText = JSON.parse(response.result);

                    modalStartButton.removeAttribute('disabled');
                    modalStartButton.style.opacity = "1";

                    modalResultText.value = resultText;

                    clearInterval(updateStream);
                });
            });

            modalTranslatePromptButton.addEventListener('click', (evt) => {
                activePrompt = "translate";
                modalTranslatePromptButton.style.background = "#555";
                modalFixGrammarPromptButton.style.background = "#333";
                modalSummarizePromptButton.style.background = "#333";
                modalCreativeWritingPromptButton.style.background = "#333";
                modalArchiveButton.style.background = "#333";
                generatePrompt();
            })

            modalFixGrammarPromptButton.addEventListener('click', (evt) => {
                activePrompt = "grammar";
                modalTranslatePromptButton.style.background = "#333";
                modalSummarizePromptButton.style.background = "#333";
                modalFixGrammarPromptButton.style.background = "#555";
                modalCreativeWritingPromptButton.style.background = "#333";
                modalArchiveButton.style.background = "#333";
                generatePrompt();
            })   

            modalCreativeWritingPromptButton.addEventListener('click', (evt) => {
                activePrompt = "rephrase";
                modalTranslatePromptButton.style.background = "#333";
                modalFixGrammarPromptButton.style.background = "#333";
                modalSummarizePromptButton.style.background = "#333";
                modalCreativeWritingPromptButton.style.background = "#555";
                modalArchiveButton.style.background = "#333";
                generatePrompt();
                
            })

            modalSummarizePromptButton.addEventListener('click', (evt) => {
                activePrompt = "summarize";
                modalSummarizePromptButton.style.background = "#555";
                modalTranslatePromptButton.style.background = "#333";
                modalFixGrammarPromptButton.style.background = "#333";
                modalCreativeWritingPromptButton.style.background = "#333";
                modalArchiveButton.style.background = "#333";
                generatePrompt();
            })

            modalArchiveButton.addEventListener('click', (evt) => {
                activePrompt = "archive";
                modalSummarizePromptButton.style.background = "#333";
                modalTranslatePromptButton.style.background = "#333";
                modalFixGrammarPromptButton.style.background = "#333";
                modalCreativeWritingPromptButton.style.background = "#333";
                modalArchiveButton.style.background = "#555";
                generatePrompt();
            })

            modalCloseButton.addEventListener('click', (evt) => {
                modal.style.display = 'none';
            })

            // Convert mouse position to 'right' and 'top' coordinates
            const updatePosition = (e: MouseEvent) => {
                const dx = startX - e.clientX;
                const dy = startY - e.clientY;
                const currentRight = parseInt(window.getComputedStyle(modal).right, 10);
                const currentTop = parseInt(window.getComputedStyle(modal).top, 10);

                modalPositionX = currentRight + dx
                modalPositionY = currentTop - dy

                modal.style.right = `${modalPositionX}px`;
                modal.style.top = `${modalPositionY}px`;

                startX = e.clientX;
                startY = e.clientY;
            };

            // Mouse down event
            modalHeader.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                modal.style.opacity = '0.8'; // Optional: Change opacity to indicate dragging
                document.addEventListener('mousemove', updatePosition, false);
            });

            // Mouse up event to finalize the drag
            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    modal.style.opacity = '0.95'; // Reset opacity after dragging
                    isDragging = false;
                    document.removeEventListener('mousemove', updatePosition, false);
                }
            });
        });
    }

    function generatePrompt() {
        console.log('generatePrompt activePrompt', activePrompt)

        switch(activePrompt) {
            case "translate":
                modalPromptText.removeAttribute('disabled');
                modalPromptText.value = `You are a simultaneous interpreter and a professionally trained translator.
Translate the following MARKDOWN into German.

Your AUDIENCE and CONTEXT for the tone is: Press, News, Newspaper, Newsletter, Magazine.

RULES:
- Translate, if MARKDOWN is in a different language.
- Adjust grammar and sentence structure to sound best for the target language
- Keep common anglicisms and terms in English, if they are widely used in the target language.
- Translate using terms and phrases that are a perfect match for the AUDIENCE and CONTEXT.
- Language detection should respect transliterated text (e.g. "Sawatdee krap" for "สวัสดีครับ")
- Must format response as Markdown.
- Translate metaphors and idioms into the target language, matching meaning.
- Always translate pronouns and gender AS IS.
- Reformat numbers, currency and dates into target language standard format.
- If the message looks like a personal email, letter etc., translate it as such and use the correct salutation and closing for the tone.
- Make sure the spelling is correct.
- Must remove irrelevant links, such as share links, advertisements, icons, category or tag cloud links etc.
END OF RULES.

MARKDOWN to translate:
${lastSelectedText}`;
                break;
            case "summarize":
                modalPromptText.removeAttribute('disabled');
                modalPromptText.value  = `Summarize the following text: ${lastSelectedText}`;
                break;
            case "grammar":
                modalPromptText.removeAttribute('disabled');
                modalPromptText.value  = `Fix the following grammar: ${lastSelectedText}`;
                break;
            case "rephrase":
                modalPromptText.removeAttribute('disabled');
                modalPromptText.value  = `Rephrase the following text: ${lastSelectedText}`;
                break;
            case "archive":
                modalPromptText.setAttribute('disabled', 'true');
                modalPromptText.value  = ``;
                break;
        }
    }

    function updateModal(type: 'selection-change' | 'mode-change') {
        
        switch(type) {
            case 'selection-change': 
                easyMde.value(lastSelectedText);
                requestAnimationFrame(() => {
                    easyMde.codemirror.refresh();
                });
                generatePrompt();
                break;
            case 'mode-change':
                if (isSettingsOpen) {
                    modalContent.style.display = 'none';
                    modalSettings.style.display = 'flex';
                } else {
                    modalContent.style.display = 'flex';
                    modalSettings.style.display = 'none';
                }
                break;
        }
    }

    window.onload = function() {

        websiteText = document.body.innerText;

        createModal();
        
        // watch text selection and flip action button display
        document.addEventListener('selectionchange',debounce(updateSelectedText, 300));
    }
})()
*/