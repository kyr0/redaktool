import { useEffect, useState } from "react";
import {
  getSelectionStore,
  selectionAtom,
  selectionGuaranteedAtom,
  type TrackedSelection,
} from "../stores/use-selection";
import { getClosestWrappingElement } from "../find-closest";

// disabled for now; a bit unstable and element selection works better
export const useSelection = (
  root: ShadowRoot | Window,
  onSelectionChanged: (selection: TrackedSelection | null) => void = () => {},
) => {
  const storedSelection = getSelectionStore();
  const [prevSelectionText, setPrevSelectionText] = useState<string>("");
  useEffect(() => {
    const trackSelectionChange = () => {
      const currentSelection = (root as Window).getSelection();

      //console.log("trackSelectionChange", currentSelection);
      if (
        currentSelection &&
        currentSelection!.toString().trim().length > 0 &&
        currentSelection.rangeCount > 0
      ) {
        const el = getClosestWrappingElement(currentSelection);

        selectionAtom.set({
          selection: currentSelection,
          text: currentSelection.toString(),
          element: el,
          markdown: "",
          //markdown: turndown(el.innerHTML),
        });
      } else {
        selectionAtom.set(null);
      }
    };
    // console.log("useSelection", storedSelection);
    document.addEventListener("selectionchange", trackSelectionChange, false);
    return () => {
      document.removeEventListener(
        "selectionchange",
        trackSelectionChange,
        false,
      );
    };
  }, []);

  useEffect(() => {
    if (storedSelection && prevSelectionText !== storedSelection.text) {
      onSelectionChanged(storedSelection);
      setPrevSelectionText(storedSelection.text);

      // set the selection change atom to the current selection
      selectionGuaranteedAtom.set(storedSelection);
    }

    if (!storedSelection) {
      selectionGuaranteedAtom.set(null);
      onSelectionChanged(null);
    }
  }, [storedSelection, prevSelectionText]);
};
