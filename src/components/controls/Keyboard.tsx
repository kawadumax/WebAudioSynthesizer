import BlackKey from "@components/parts/BlackKey";
import WhiteKey from "@components/parts/WhiteKey";
import useKeyboardCircuit, {
  useKeyboardContext,
} from "../circuits/KeyboardCircuit";
import { Tone } from "../circuits/TypeCircuit";
import { useEffect, useRef } from "react";

interface Props {
  width?: number;
  height?: number;
  numOfKeys?: number;
}

const Keyboard = ({ width, height, numOfKeys = 24 }: Props) => {
  const keyboardContext = useKeyboardContext();
  if (!keyboardContext) {
    throw new Error("KeyboardContext is not provided.");
  }
  const { setIsKeyPressed, isKeyPressed } = keyboardContext;
  const { makeSequencedKeys, handleStartSound, handleStopSound } =
    useKeyboardCircuit();
  const startKey = 44;
  const endKey = startKey + numOfKeys;
  const { naturalTones, accidentalTones } = makeSequencedKeys(startKey, endKey);

  const Padding = 10;
  const SVG_WIDTH = (width ? width : 200) + Padding;
  const SVG_HEIGHT = (height ? height : 100) + Padding;
  const KEYBOARD_WIDTH = width ? width : 200;
  const KEYBOARD_HEIGHT = height ? height : 100;
  const KEY_WIDTH = KEYBOARD_WIDTH / naturalTones.length;

  const handleKeyPressed = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    console.log("Pressed: ", event);
    setIsKeyPressed(true);
  };

  const handleKeyReleased = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    console.log("Released: ", event);
    setIsKeyPressed(false);
  };

  // const handleTouchMove: React.TouchEventHandler<SVGSVGElement> = (event) => {
  //   event.preventDefault();
  //   console.log("Touch Moved: ", event);
  // };

  const handleTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    console.log("Touch Start: ", event);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault();
    console.log("Touch End: ", event);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleKeyPressed);
    document.addEventListener("mouseup", handleKeyReleased);
    //event.preventDefault()と{ passive: false }の組み合わせでスクロールも無効化できる。
    // document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("mousedown", handleKeyPressed);
      document.removeEventListener("mouseup", handleKeyReleased);
      // document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const refSVG = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      console.log("Touch Moved: ", event);
    };

    const element = refSVG.current;
    if (element) {
      element.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
    }

    return () => {
      if (element) {
        element.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, []);

  const createKeyProps = (index: number, x: number, tone: Tone) => ({
    key: index,
    x,
    y: Padding / 2,
    width: KEY_WIDTH,
    height: KEYBOARD_HEIGHT,
    index,
    onKeyPressed: handleStartSound,
    onKeyReleased: handleStopSound,
    tone,
  });

  const renderWhiteKeys = () => {
    return naturalTones.map((tone, index) => (
      <WhiteKey
        {...createKeyProps(index, index * KEY_WIDTH + Padding / 2, tone)}
      ></WhiteKey>
    ));
  };

  const renderBlackKeys = () => {
    const result: Array<JSX.Element | null> = [];

    naturalTones.forEach((ntone, index, naturalTones) => {
      if (
        ntone.name.includes("E") ||
        ntone.name.includes("B") ||
        index === naturalTones.length - 1
      ) {
        result.push(null);
        return;
      }
      const atone = accidentalTones.shift();
      if (atone) {
        result.push(
          <BlackKey
            {...createKeyProps(
              index,
              index * KEY_WIDTH + Padding / 2 + KEY_WIDTH / 2,
              atone
            )}
          ></BlackKey>
        );
      }
    });
    return result;
  };

  return (
    <svg
      width="100%"
      height={SVG_HEIGHT}
      viewBox={"0 0 " + SVG_WIDTH + " " + SVG_HEIGHT}
      // onTouchMove={handleTouchMove}
      ref={refSVG}
    >
      {renderWhiteKeys()}
      {renderBlackKeys()}
    </svg>
  );
};

export default Keyboard;
