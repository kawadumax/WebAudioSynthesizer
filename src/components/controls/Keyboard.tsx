import BlackKey from "@parts/BlackKey";
import WhiteKey from "@parts/WhiteKey";
import useKeyboardCircuit, {
  useKeyboardContext,
} from "../circuits/KeyboardCircuit";
import { Tone } from "@/modules/Type";
import { useEffect, useRef } from "react";
import { containsPoint, Point } from "@/modules/utils/DomUtils";
interface Props {
  width?: number;
  height?: number;
  numOfKeys?: number;
}

const Keyboard = ({ width, height, numOfKeys = 24 }: Props) => {
  const keyboardContext = useKeyboardContext();
  const refSVG = useRef<SVGSVGElement>(null);

  if (!keyboardContext) {
    throw new Error("KeyboardContext is not provided.");
  }
  const { setIsKeyPressed } = keyboardContext;
  const {
    makeSequencedKeys,
    handleStartSound,
    handleStartSomeSounds,
    handleStopSound,
    handleStopAllSound,
    handleStopExcepts,
    handleStartAndStopExceptSound,
  } = useKeyboardCircuit();
  const startKey = 44;
  const endKey = startKey + numOfKeys;
  const { naturalTones, accidentalTones } = makeSequencedKeys(startKey, endKey);

  const Padding = 10;
  const SVG_WIDTH = (width ? width : 200) + Padding;
  const SVG_HEIGHT = (height ? height : 100) + Padding;
  const KEYBOARD_WIDTH = width ? width : 200;
  const KEYBOARD_HEIGHT = height ? height : 100;
  const KEY_WIDTH = KEYBOARD_WIDTH / naturalTones.length;

  const getTone = (position: Point): Tone | undefined => {
    const keyboardSVG = refSVG.current;
    if (
      !keyboardSVG ||
      !containsPoint(keyboardSVG.getBoundingClientRect(), position)
    ) {
      //////キーボードがない、またはキーボードの範囲内にポインタがないとき、早期リターン
      return;
    }
    return (
      getBlackTone(keyboardSVG, position) || getWhiteTone(keyboardSVG, position)
    );
  };

  const getBlackTone = (
    svg: SVGSVGElement,
    position: Point
  ): Tone | undefined => {
    const keys = svg.children;
    const keyRects = Array.from(keys).map((key) => key.getBoundingClientRect());
    const blackKeyRects = keyRects.slice(naturalTones.length);
    if (position.y > blackKeyRects[0].bottom) {
      //タッチのy座標がキーボードの下半分にあるとき、早期リターン
      return;
    }
    const touchedKeyIndex = blackKeyRects.findIndex((rect) => {
      return containsPoint(rect, position);
    });

    return accidentalTones[touchedKeyIndex];
  };

  const getWhiteTone = (
    svg: SVGSVGElement,
    position: Point
  ): Tone | undefined => {
    const keyboardRect = svg.getBoundingClientRect();
    const scaledWhiteKeyWidth = keyboardRect.width / naturalTones.length;
    // タッチの座標が各鍵盤のどの領域にあるのかを判定する。
    const touchedKeyOrder = Math.floor(
      (position.x - keyboardRect.left) / scaledWhiteKeyWidth
    );
    return naturalTones[touchedKeyOrder];
  };

  const processToneAtPoint = (event: React.TouchEvent) => {
    event.preventDefault();
    const touchedTone = getTone({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    });
    if (touchedTone) {
      handleStartAndStopExceptSound(touchedTone);
    } else {
      handleStopAllSound();
    }
  };

  const processToneAtPoints = (event: React.TouchEvent) => {
    event.preventDefault();
    const touchedTones = Array.from(event.touches)
      .map((t) => getTone({ x: t.clientX, y: t.clientY }))
      .filter(Boolean) as Tone[];

    if (touchedTones.length > 0) {
      handleStartSomeSounds(touchedTones);
      handleStopExcepts(touchedTones);
    } else {
      handleStopAllSound();
    }
  };

  // const handleMousePressed = (event: MouseEvent | TouchEvent) => {
  //   event.preventDefault();
  //   setIsKeyPressed(true);
  // };

  // const handleMouseReleased = (event: MouseEvent | TouchEvent) => {
  //   event.preventDefault();
  //   setIsKeyPressed(false);
  // };

  // const handleTouchStart = (event: TouchEvent) => {
  //   processToneAtPoints(event);
  // };

  // const handleTouchMove = (event: TouchEvent) => {
  //   processToneAtPoints(event);
  // };

  // const handleTouchEnd = (event: TouchEvent) => {
  //   event.preventDefault();
  //   handleStopAllSound();
  // };

  const handleMousePressed = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    setIsKeyPressed(true);
  };

  const handleMouseReleased = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    setIsKeyPressed(false);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    processToneAtPoints(event);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    processToneAtPoints(event);
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    event.preventDefault();
    handleStopAllSound();
  };

  // useEffect(() => {
  //   document.addEventListener("mousedown", handleMousePressed);
  //   document.addEventListener("mouseup", handleMouseReleased);
  //   //event.preventDefault()と{ passive: false }の組み合わせでスクロールも無効化できる。
  //   document.addEventListener("touchmove", handleTouchMove, { passive: false });
  //   document.addEventListener("touchstart", handleTouchStart, {
  //     passive: false,
  //   });
  //   document.addEventListener("touchend", handleTouchEnd, { passive: false });

  //   return () => {
  //     document.removeEventListener("mousedown", handleMousePressed);
  //     document.removeEventListener("mouseup", handleMouseReleased);
  //     document.removeEventListener("touchmove", handleTouchMove);
  //     document.removeEventListener("touchstart", handleTouchStart);
  //     document.removeEventListener("touchend", handleTouchEnd);
  //   };
  // }, []);

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
    const accidentalTonesCopy = [...accidentalTones];

    naturalTones.forEach((ntone, index, naturalTones) => {
      if (
        ntone.name.includes("E") ||
        ntone.name.includes("B") ||
        index === naturalTones.length - 1
      ) {
        result.push(null);
        return;
      }
      const atone = accidentalTonesCopy.shift();
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
      height="100%"
      viewBox={"0 0 " + SVG_WIDTH + " " + SVG_HEIGHT}
      ref={refSVG}
      onMouseDown={handleMousePressed}
      onMouseUp={handleMouseReleased}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {renderWhiteKeys()}
      {renderBlackKeys()}
    </svg>
  );
};

export default Keyboard;
