import { useCallback, useEffect, useRef, useState } from "react";
import type { Point } from "@/modules/utils/DomUtils";
import { useKeyboardContext } from "../circuits/KeyboardCircuit/KeyboardContextProvider";
import useKeyboardManager from "../circuits/KeyboardCircuit/KeyboardManager";
import useSoundHandlers from "../circuits/KeyboardCircuit/SoundHandlers";

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
    constantsRef,
    getTone,
    getBlackTonesByIndexes,
    getWhiteTonesByIndexes,
    getKeyIndexes,
    getKeyElementsByRefIndexes,
  } = useKeyboardManager(startKey, endKey, width || 200, height || 100);

  const { isKeyPressed, setIsKeyPressed } = keyboardContext;
  const [touchedKeys, setTouchedKeys] = useState<SVGGElement[]>([]);
  const refSVG = useRef<SVGSVGElement>(null);

  const {
    handleStartSomeSounds,
    handleStopAllSound,
    handleStopExcepts,
    handleStartAndStopExceptSound,
  } = useSoundHandlers();

  const processToneAtPoint = useCallback(
    (event: MouseEvent) => {
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
    },
    [getTone, handleStartAndStopExceptSound, handleStopAllSound],
  );

  const processToneAtPoints = useCallback(
    (event: TouchEvent) => {
      event.preventDefault();
      const points = Array.prototype.map.call(event.touches, (t: Touch) => ({
        x: t.clientX,
        y: t.clientY,
      })) as Point[];

      const { blackRefsIndexes, whiteRefsIndexes } = getKeyIndexes(points);
      if (!blackRefsIndexes.length && !whiteRefsIndexes.length) return;
      const touchedKeys = getKeyElementsByRefIndexes(blackRefsIndexes, whiteRefsIndexes);
      setTouchedKeys(touchedKeys);

      const touchedTones = [
        ...getBlackTonesByIndexes(blackRefsIndexes),
        ...getWhiteTonesByIndexes(whiteRefsIndexes),
      ];
      if (touchedTones.length > 0) {
        handleStartSomeSounds(touchedTones);
        handleStopExcepts(touchedTones);
      } else {
        handleStopAllSound();
      }
    },
    [
      getBlackTonesByIndexes,
      getKeyElementsByRefIndexes,
      getKeyIndexes,
      getWhiteTonesByIndexes,
      handleStartSomeSounds,
      handleStopAllSound,
      handleStopExcepts,
    ],
  );

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

  const handleMousePressed = useCallback(
    (event: MouseEvent) => {
      setIsKeyPressed(true);
      processToneAtPoint(event);
    },
    [processToneAtPoint, setIsKeyPressed],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      processToneAtPoint(event);
    },
    [processToneAtPoint],
  );

  const handleMouseReleased = useCallback(
    (_event: MouseEvent) => {
      setIsKeyPressed(false);
      handleStopAllSound();
    },
    [handleStopAllSound, setIsKeyPressed],
  );

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      setIsKeyPressed(true);
      processToneAtPoints(event);
    },
    [processToneAtPoints, setIsKeyPressed],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      processToneAtPoints(event);
    },
    [processToneAtPoints],
  );

  const handleTouchEnd = useCallback(
    (_event: TouchEvent) => {
      setIsKeyPressed(false);
      setTouchedKeys([]);
      handleStopAllSound();
    },
    [handleStopAllSound, setIsKeyPressed],
  );

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
  }, [handleMousePressed, handleTouchStart]);

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
  }, [isKeyPressed, handleMouseMove, handleMouseReleased, handleTouchEnd, handleTouchMove]);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${constantsRef.current?.SVG_WIDTH} ${constantsRef.current?.SVG_HEIGHT}`}
      ref={refSVG}
      aria-label="Keyboard"
    >
      <title>Keyboard</title>
      {whiteKeyElements}
      {blackKeyElements}
    </svg>
  );
};

export default Keyboard;
