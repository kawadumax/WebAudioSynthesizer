import { useKeyboardContext } from "../circuits/KeyboardCircuit/KeyboardContextProvider";
import useSoundHandlers from "../circuits/KeyboardCircuit/SoundHandlers";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Point } from "@/modules/utils/DomUtils";
import useKeyboardManager from "../circuits/KeyboardCircuit/KeyboardManager";

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
  const startKey = 44;
  const endKey = startKey + numOfKeys;
  const {
    blackKeyElements,
    whiteKeyElements,
    blackKeyRefs,
    whiteKeyRefs,
    constantsRef,
    getTone,
    getTonesByPoints,
    getBlackTonesByIndexes,
    getWhiteTonesByIndexes,
    getKeyIndexes,
    getKeyElementsByRefIndexes,
    wholeTones,
    naturalTones,
    accidentalTones,
  } = useKeyboardManager(startKey, endKey, width || 200, height || 100);

  const { isKeyPressed, setIsKeyPressed } = keyboardContext;
  const [touchedKeys, setTouchedKeys] = useState<Element[]>([]);
  const refSVG = useRef<SVGSVGElement>(null);

  const processToneAtPoint = (event: MouseEvent) => {
    event.preventDefault();
    const point = {
      x: event.clientX,
      y: event.clientY,
    };
    const touchedTone = getTone(point);
    if (touchedTone) {
      handleStartAndStopExceptSound(touchedTone);
    } else {
      handleStopAllSound();
    }
  };

  const processToneAtPoints = (event: TouchEvent) => {
    event.preventDefault();
    const points = Array.prototype.map.call(event.touches, (t: Touch) => ({
      x: t.clientX,
      y: t.clientY,
    })) as Point[];

    //touchされているキーとtoneを取得する
    const { blackRefsIndexes, whiteRefsIndexes } = getKeyIndexes(points);
    if (!blackRefsIndexes.length && !whiteRefsIndexes.length) return;
    const touchedKeys = getKeyElementsByRefIndexes(blackRefsIndexes, whiteRefsIndexes);
    //TODO: 型が合わない
    // setTouchedKeys(touchedKeys);

    const touchedTones = [
      ...getBlackTonesByIndexes(blackRefsIndexes),
      ...getWhiteTonesByIndexes(whiteRefsIndexes)
    ];
    if (touchedTones.length > 0) {
      handleStartSomeSounds(touchedTones);
      handleStopExcepts(touchedTones);
    } else {
      handleStopAllSound();
    }
  };

  useEffect(() => {
    for (const key of touchedKeys) {
      key.classList.add("hover");
    }
    return () => {
      for (const key of touchedKeys) {
        key.classList.remove("hover");
      }
    };
  }, [touchedKeys]);

  const {
    handleStartSound,
    handleStartSomeSounds,
    handleStopSound,
    handleStopAllSound,
    handleStopExcepts,
    handleStartAndStopExceptSound,
  } = useSoundHandlers();

  const handleMousePressed = (event: MouseEvent) => {
    setIsKeyPressed(true);
    processToneAtPoint(event);
  };

  const handleMouseMove = (event: MouseEvent) => {
    processToneAtPoint(event);
  };

  const handleMouseReleased = (event: MouseEvent) => {
    setIsKeyPressed(false);
    handleStopAllSound();
  };

  const handleTouchStart = (event: TouchEvent) => {
    setIsKeyPressed(true);
    processToneAtPoints(event);
  };

  const handleTouchMove = (event: TouchEvent) => {
    processToneAtPoints(event);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    setIsKeyPressed(false);
    handleStopAllSound();
  };

  useEffect(() => {
    const current = refSVG.current;
    current?.addEventListener("mousedown", handleMousePressed, {
      passive: false,
    });
    current?.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    return () => {
      current?.removeEventListener("mousedown", handleMousePressed);
      current?.removeEventListener("touchstart", handleTouchStart);
    };
  }, [blackKeyRefs, whiteKeyRefs]);

  useEffect(() => {
    if (isKeyPressed) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseReleased, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd, { passive: false });
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseReleased);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isKeyPressed]);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={"0 0 " + constantsRef.current?.SVG_WIDTH + " " + constantsRef.current?.SVG_HEIGHT}
      ref={refSVG}
    >
      {whiteKeyElements}
      {blackKeyElements}
    </svg>
  );
};

export default Keyboard;
