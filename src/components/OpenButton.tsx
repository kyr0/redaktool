import { prefPerPage } from "../lib/content-script/prefs";
import { Button } from "../ui/button";
import { useDraggable } from "../lib/content-script/hooks/use-draggable";
import { safeDisplayPosition } from "../lib/content-script/utils";
import { FTRLogoDark, FTRLogoLight } from "./Icons";

const storedButtonPositionPref = prefPerPage<any>("open_button_position", {
  x: 0,
  y: 0,
});

// deprecated/disabled: floating, movable overlay button
export const OpenButton: React.FC<any> = () => {
  const draggableRef = useDraggable(
    safeDisplayPosition(storedButtonPositionPref.get()),
    (x: number, y: number) => {
      storedButtonPositionPref.set({ x, y });
    },
  );

  return (
    <div
      ref={draggableRef as any}
      style={{ position: "fixed", cursor: "move" }}
    >
      <Button
        variant="outline"
        className="ab-rounded-full ab-ftr-bg ab-w-[40px] ab-h-[40px] !ab-p-0 !ab-m-0"
      >
        <FTRLogoDark className="ab-hidden dark:ab-flex ab-w-full ab-h-max" />
        <FTRLogoLight className="ab-flex dark:ab-hidden ab-w-full ab-h-max" />
      </Button>
    </div>
  );
};
