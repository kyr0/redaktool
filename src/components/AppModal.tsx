import { useCallback, useEffect, useState } from "react";
import { prefPerPage } from "../lib/content-script/prefs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  HeaderButtonStyle,
} from "../ui/dialog";
import { OpenButton } from "./OpenButton";
import { useDraggable } from "../lib/content-script/hooks/use-draggable";
import { Resizable } from "./Resizable";
import { safeDisplayPosition } from "../lib/content-script/utils";
import { useKeystroke } from "../lib/content-script/hooks/use-keystroke";
import {
  getSelectionGuaranteedStore,
  guardedSelectionGuaranteedAtom,
} from "../lib/content-script/stores/use-selection";
import { DarkMode, FTRLogoDark, FTRLogoLight } from "./Icons";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useDarkMode } from "../lib/content-script/hooks/use-darkmode";
import { PointerIcon, X } from "lucide-react";
import { getAnchorNode } from "../lib/content-script/find-closest";
import { useElementSelector } from "../lib/content-script/hooks/use-element-selector";
import { useSelection } from "../lib/content-script/hooks/use-selection";
import { turndown } from "../lib/content-script/turndown";
import { scratchpadEditorContentAtom } from "../lib/content-script/stores/scratchpad";
import {
  copyToClipboard,
  deselect,
  restorePreviousSelection,
  selectEditorContent,
} from "../lib/content-script/clipboard";
import "../i18n/config";
import { useTranslation, Trans } from "react-i18next";
import { Logo } from "./Logo";
import { cloneAndFilterNode } from "../lib/content-script/dom";

export type ZoomOptions =
  | "ab-scale-75"
  | "ab-scale-90"
  | "ab-scale-95"
  | "ab-scale-100"
  | "ab-scale-105"
  | "ab-scale-110"
  | "ab-scale-125";

export const AppModal: React.FC<any> = ({ children }) => {
  // disabled text selection magic ;)
  //useSelection()
  const { t, i18n } = useTranslation();

  const storedDialogPositionPref = prefPerPage<any>("dialog_position", {
    x: 100,
    y: 100,
  });
  const storedDialogSizePref = prefPerPage<any>("dialog_size", {
    w: 1024,
    h: 768,
  });
  const [positioningClasses, setPositioningClasses] = useState<string>(
    "ab-fixed ab-left-[100px] ab-top-[100px]",
  );

  const [zoomClasses, setZoomClasses] = useState<ZoomOptions>("ab-scale-100");
  const storedSize = storedDialogSizePref.get();

  const dialogRef = useDraggable(
    safeDisplayPosition(storedDialogPositionPref.get()),
    (x: number, y: number) => {
      storedDialogPositionPref.set({ x, y });
      setPositioningClasses("ab-fixed ab-transform-none");
    },
    { startCentered: false, handleSelector: ".ab-dialog-drag-handle" },
  );

  const [showOpenButton, setShowOpenButton] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { set: setDarkMode, get: getDarkMode } = useDarkMode();

  const onDarkModeToggle = useCallback(async () => {
    const isDarkModeEnabled = await getDarkMode();
    console.log("dark mode enabled", isDarkModeEnabled);
    setDarkMode(!isDarkModeEnabled);
  }, []);

  // language switch
  const onChangeLanguageButtonClick = useCallback(() => {
    console.log("change language button clicked");

    if (i18n.language === "de") {
      i18n.changeLanguage("en");
    } else {
      i18n.changeLanguage("de");
    }
  }, []);

  const selectionGuaranteed$ = getSelectionGuaranteedStore();

  const activateElementSelection = useElementSelector((element) => {
    if (element.querySelector("body")) {
      element = element.querySelector("body")!;
    }

    element = cloneAndFilterNode(element) as HTMLElement;

    // set the markdown content to the selected element
    scratchpadEditorContentAtom.set(turndown(element.innerHTML));
    setShowDialog(true);

    requestAnimationFrame(() => {
      // TODO: no code duplication
      const prevSelectionDetails = selectEditorContent("scratchpadEditor");

      requestAnimationFrame(() => {
        document.execCommand("copy");

        restorePreviousSelection(prevSelectionDetails);
      });
    });
  });

  const onInspectButtonClick = () => {
    console.log("inspect button clicked, activate inspection");
    activateElementSelection();
    setShowDialog(false);
  };

  useEffect(() => {
    setShowOpenButton(false);
    if (!selectionGuaranteed$) return;

    const anchorNode = getAnchorNode(selectionGuaranteed$.selection);

    if (!dialogRef.current?.contains(anchorNode)) {
      console.log("valid selection", selectionGuaranteed$);

      guardedSelectionGuaranteedAtom.set(selectionGuaranteed$);
      scratchpadEditorContentAtom.set(selectionGuaranteed$.markdown);

      requestAnimationFrame(() => {
        const prevSelectionDetails = selectEditorContent("scratchpadEditor");

        requestAnimationFrame(() => {
          document.execCommand("copy");
          //deselect()
          restorePreviousSelection(prevSelectionDetails);
        });
      });

      setShowOpenButton(true);
    }
  }, [selectionGuaranteed$, dialogRef]);

  // open with Control + f or alt + f
  useKeystroke("f", () => {
    console.log("pressed f to open");
    setShowOpenButton(false);
    setShowDialog(true);
  });

  // safe mode open with Control + s or alt + s
  useKeystroke("s", () => {
    storedDialogPositionPref.set({ x: window.scrollX, y: window.scrollY });
    setShowOpenButton(false);
    setShowDialog(true);
  });

  useEffect(() => {
    console.log("positioning classes changed", positioningClasses);
  }, [positioningClasses]);

  useEffect(() => {
    document.addEventListener("OpenFTRTools", (event) => {
      console.log("Received in ISOLATED world: open!");
      setShowOpenButton(false);
      setShowDialog(true);
    });
  }, []);

  return (
    <Dialog
      open={showDialog}
      onOpenChange={(open) => {
        console.log("open changed", open);
        setShowDialog(open);
        if (open) {
          console.log("open changed to true");
          setShowOpenButton(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <div className={`${showOpenButton ? "ab-block" : "ab-hidden"}`}>
          <OpenButton />
        </div>
      </DialogTrigger>
      <DialogContent
        ref={dialogRef as any}
        showOverlay={false}
        wrapperClassName={`${positioningClasses} ${zoomClasses} ab-ftr-bg-contrast ab-z-[2147483640] ab-rounded-sm ab-flex`}
        className="!ab-p-2 !ab-gap-0"
      >
        <DialogHeader className="ab-select-none ab-h-8 ab-pt-1 ab-pr-1 ab-pl-1 ab-space-0 ab-dialog-drag-handle ab-ftr-bg-halfcontrast ab-rounded-sm">
          <DialogTitle className="ab-text-lg ab-flex ab-flex-row ab-justify-between ab-items-center">
            <div className="ab-flex ab-flex-row ab-items-center ab-ml-2">
              <Logo className="ab-h-6 ab-w-6 ab-mr-1" alt="RedakTool Logo" />
              {t("productName")}
            </div>

            <div className="ab-flex ab-flex-row ab-items-center">
              <button
                type="button"
                onClick={onInspectButtonClick}
                className={HeaderButtonStyle}
              >
                <PointerIcon className="ab-h-4 ab-w-4 ab-shrink-0" />
                <span className="ab-sr-only">Select element</span>
              </button>

              <button
                type="button"
                className={HeaderButtonStyle}
                onClick={onDarkModeToggle}
              >
                <DarkMode className="ab-h-4 ab-w-4 ab-shrink-0" />
                <span className="ab-sr-only">Toggle Mode</span>
              </button>

              <button
                type="button"
                onClick={onChangeLanguageButtonClick}
                className={HeaderButtonStyle}
              >
                <div>{t("language")}</div>
                <span className="ab-sr-only">{t("language")}</span>
              </button>

              <DialogPrimitive.Close className={`${HeaderButtonStyle} ab-mr-1`}>
                <X className="ab-h-4 ab-w-4 ab-shrink-0" />
                <span className="ab-sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Resizable
          onUpdateSize={(w: number, h: number) => {
            storedDialogSizePref.set({ w, h });
          }}
          initialSize={storedSize}
          className="ab-right-1"
        >
          {children}
        </Resizable>
      </DialogContent>
    </Dialog>
  );
};
