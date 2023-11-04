import BlackKey from "@parts/BlackKey";
import WhiteKey from "@parts/WhiteKey";
import useKeyboardCircuit, {
  useKeyboardContext,
} from "../circuits/KeyboardCircuit";
import { Tone } from "@/modules/Type";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { containsPoint, mapToDOMRects, Point, splitArray, findRectIndex } from "@/modules/utils/DomUtils";
interface Props {
  width?: number;
  height?: number;
  numOfKeys?: number;
}

const Keyboard = ({ width, height, numOfKeys = 24 }: Props) => {
  const keyboardContext = useKeyboardContext();
  const [touchedKeys, setTouchedKeys] = useState<Element[]>([]);
  const refSVG = useRef<SVGSVGElement>(null);

  if (!keyboardContext) {
    throw new Error("KeyboardContext is not provided.");
  }
  const { isKeyPressed, setIsKeyPressed } = keyboardContext;
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

  // const getTones = (position: Point): Tone | undefined => {
  //   const keyboardSVG = refSVG.current;
  //   if (
  //     keyboardSVG &&
  //     containsPoint(keyboardSVG.getBoundingClientRect(), position)
  //   ) {
  //     return getBlackTones(keyboardSVG, position) || getWhiteTones(keyboardSVG, position);
  //   }
  // };

  // const getBlackTones = (
  //   svg: SVGSVGElement,
  //   position: Point
  // ): Tone | undefined => {
  //   const keys = svg.children;
  //   const keyRects = Array.from(keys).map((key) => key.getBoundingClientRect());
  //   const blackKeyRects = keyRects.slice(naturalTones.length);
  //   if (position.y > blackKeyRects[0].bottom) {
  //     //タッチのy座標がキーボードの下半分にあるとき、早期リターン
  //     return;
  //   }

  //   const touchedKeyIndex = blackKeyRects.findIndex((rect) => {
  //     return containsPoint(rect, position);
  //   });

  //   return accidentalTones[touchedKeyIndex];
  // };

  // const getWhiteTones = (
  //   svg: SVGSVGElement,
  //   position: Point
  // ): Tone | undefined => {
  //   const keyboardRect = svg.getBoundingClientRect();
  //   const scaledWhiteKeyWidth = keyboardRect.width / naturalTones.length;
  //   // タッチの座標が各鍵盤のどの領域にあるのかを判定する。
  //   const touchedKeyOrder = Math.floor(
  //     (position.x - keyboardRect.left) / scaledWhiteKeyWidth
  //   );
  //   return naturalTones[touchedKeyOrder];
  // };

  const getKey = (point: Point): Element | undefined => {
    const svg = refSVG.current;
    if (!svg) return;
    const keys = svg.children;
    const keyRects = mapToDOMRects(keys);
    const [whiteKeyRects, blackKeyRects] = splitArray(keyRects, naturalTones.length);
    const index = findRectIndex(blackKeyRects, point) || findRectIndex(whiteKeyRects, point);
    if (!index) return;
    return keys[index];
  }

  const getTone = (key: Element): Tone => {
    return;
  }

  const processToneAtPoint = (event: MouseEvent) => {
    event.preventDefault();
    const point = {
      x: event.clientX,
      y: event.clientY
    };
    const touchedKey = getKey(point);
    setTouchedKeys(touchedKey)
    if (!touchedKey) return;
    touchedKey.classList.add("hover");
    const touchedTone = getTone(touchedKey);
    if (touchedTone) {
      handleStartAndStopExceptSound(touchedTone);
    } else {
      handleStopAllSound();
    }
  };

  const processToneAtPoints = (event: TouchEvent) => {
    event.preventDefault();
    const touchedTones = Array.from(event.touches)
      .map((t) => getTones({ x: t.clientX, y: t.clientY }))
      .filter(Boolean) as Tone[];

    if (touchedTones.length > 0) {
      handleStartSomeSounds(touchedTones);
      handleStopExcepts(touchedTones);
    } else {
      handleStopAllSound();
    }
  };

  const handleMousePressed = (event: MouseEvent) => {
    event.preventDefault();
    setIsKeyPressed(true);
    processToneAtPoint(event);
  };

  const handleTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    setIsKeyPressed(true);
    processToneAtPoints(event);
  };

  const handleTouchMove = (event: TouchEvent) => {
    processToneAtPoints(event);
  };

  const handleMouseMove = (event: MouseEvent) => {
    processToneAtPoint(event);
  }

  const handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault();
    setIsKeyPressed(false);
    handleStopAllSound();
  };

  const handleMouseReleased = (event: MouseEvent) => {
    event.preventDefault();
    setIsKeyPressed(false);
    handleStopAllSound();
  };

  useEffect(() => {
    const current = refSVG.current;
    current?.addEventListener("mousedown", handleMousePressed, { passive: false });
    current?.addEventListener("touchstart", handleTouchStart, { passive: false });
    return () => {
      current?.removeEventListener("mousedown", handleMousePressed);
      current?.removeEventListener("touchstart", handleTouchStart);
    }
  }, [])

  useEffect(() => {
    if (isKeyPressed) {
      document.addEventListener("mousemove", handleMouseMove, { passive: false });
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("mouseup", handleMouseReleased, { passive: false });
      document.addEventListener("touchend", handleTouchEnd, { passive: false });
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseReleased);
      document.removeEventListener("touchend", handleTouchEnd);
    }
  }, [isKeyPressed]);

  const createKeyProps = (index: number, x: number, tone: Tone) => ({
    key: index,
    x,
    y: Padding / 2,
    width: KEY_WIDTH,
    height: KEYBOARD_HEIGHT,
    index,
    tone,
    hover: false
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
    >
      {renderWhiteKeys()}
      {renderBlackKeys()}
    </svg>
  );
};

export default Keyboard;
