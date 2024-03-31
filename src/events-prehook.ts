/** algorithms for pre-website execution code injection; allows for all kinds of spooky magic ;) */
import { getCssSelector } from "css-selector-generator";
import { prefPerPage } from "./lib/content-script/prefs";

// Extend the Window interface to include $$_ftrEventListenersMap
declare global {
    interface HTMLElement {
        $$_ftrEventListenersMap: Map<EventTarget, Map<string, EventListenerOrEventListenerObject[]>>;
        $$_ftrMediaElements: Array<string>;
    }
}

const init = () => {
    // Ensure the global map exists on the window object
    if (document.body && !document.body.$$_ftrEventListenersMap) {
        (document.body as any).$$_ftrEventListenersMap = new Map<EventTarget, Map<string, EventListenerOrEventListenerObject[]>>();
    }
    if (document.body && !document.body.$$_ftrMediaElements) {
        (document.body as any).$$_ftrMediaElements = []
    }
}

// Corrected implementation for addEventListener and removeEventListener
/*
const originalAddEventListener = EventTarget.prototype.addEventListener;
const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

EventTarget.prototype.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {

    //console.log('addEventListener called', this, listener, type, options)
    //init();

    let listenersForElement = document.body.$$_ftrEventListenersMap.get(this);
    if (!listenersForElement) {
        listenersForElement = new Map<string, EventListenerOrEventListenerObject[]>();
        document.body.$$_ftrEventListenersMap.set(this, listenersForElement);
    }

    let listenersForType = listenersForElement.get(type);
    if (!listenersForType) {
        listenersForType = [];
        listenersForElement.set(type, listenersForType);
    }

    listenersForType.push(listener); // Correct usage of push for an array

    originalAddEventListener.call(this, type, listener, options);
};

EventTarget.prototype.removeEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {

    //init();

    const listenersForElement = document.body.$$_ftrEventListenersMap.get(this);
    if (listenersForElement) {
        const listenersForType = listenersForElement.get(type);
        if (listenersForType) {
            const index = listenersForType.findIndex(l => l === listener);
            if (index !== -1) {
                listenersForType.splice(index, 1);
            }

            if (listenersForType.length === 0) {
                listenersForElement.delete(type);
            }
        }

        if (listenersForElement.size === 0) {
            document.body.$$_ftrEventListenersMap.delete(this);
        }
    }

    originalRemoveEventListener.call(this, type, listener, options);
};
*/

const broadcastMediaElementSelectors = () => {
    prefPerPage<Array<string>>('mediaElements', []).set(document.body.$$_ftrMediaElements);
}

document.addEventListener('DOMContentLoaded', function () {

    init();
    
    document.querySelectorAll('audio, video').forEach((element) => {
        document.body.$$_ftrMediaElements.push(getCssSelector(element as HTMLMediaElement));
    })
    broadcastMediaElementSelectors();

    // Function to handle mutations
    const handleMutations: MutationCallback = (mutationsList) => {
        for (const mutation of mutationsList) {
            // Check for added nodes
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    // Check if the added node is an audio or video element
                    if (node instanceof HTMLAudioElement || node instanceof HTMLVideoElement) {
                        console.log(`${node instanceof HTMLAudioElement ? 'audio' : 'video'} appended`, node);


                        document.body.$$_ftrMediaElements.push(getCssSelector(node as HTMLElement));
                        broadcastMediaElementSelectors();
                    }
                });
            }
        }
    };

    // Create a new MutationObserver instance
    const observer = new MutationObserver(handleMutations);

    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };

    // Start observing the document body for DOM mutations
    observer.observe(document.body, config);
});


