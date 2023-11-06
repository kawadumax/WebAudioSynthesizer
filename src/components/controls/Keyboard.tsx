import BlackKey from "@parts/BlackKey";
import WhiteKey from "@parts/WhiteKey";
import { useKeyboardContext } from "../circuits/KeyboardCircuit/KeyboardContextProvider";
import {
  SoundHandlers,
  makeSequencedKeys,
} from "../circuits/KeyboardCircuit/KeyboardCircuit";
import { Tone } from "@/modules/Type";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Point } from "@/modules/utils/DomUtils";

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
  const { isKeyPressed, setIsKeyPressed } = keyboardContext;
  const [touchedKeys, setTouchedKeys] = useState<Element[]>([]);
  const refSVG = useRef<SVGSVGElement>(null);

  const startKey = 44;
  const endKey = startKey + numOfKeys;
  const { rangedWholeTones, rangedNaturalTones, rangedAccidentalTones } =
    makeSequencedKeys(startKey, endKey);

  const Padding = 10;
  const SVG_WIDTH = (width ? width : 200) + Padding;
  const SVG_HEIGHT = (height ? height : 100) + Padding;
  const KEYBOARD_WIDTH = width ? width : 200;
  const KEYBOARD_HEIGHT = height ? height : 100;
  const KEY_WIDTH = KEYBOARD_WIDTH / rangedNaturalTones.length;

  const processToneAtPoint = (event: MouseEvent) => {
    event.preventDefault();
    const point = {
      x: event.clientX,
      y: event.clientY,
    };
    const touchedTone = getTones(point);
    if (touchedTone) {
      handleStartAndStopExceptSound(touchedTone);
    } else {
      handleStopAllSound();
    }
  };

  const processToneAtPoints = (event: TouchEvent) => {
    event.preventDefault();
    const svg = refSVG.current;
    if (!svg) return [];
    const keys = svg.children;
    const points = Array.prototype.map.call(event.touches, (t: Touch) => ({
      x: t.clientX,
      y: t.clientY,
    })) as Point[];
    const touchedKeyIndexes = getKeyIndexes(keys, points);
    if (!touchedKeyIndexes) return;
    const touchedkeys = touchedKeyIndexes.map((index) => {
      return keys[index];
    });
    setTouchedKeys(touchedKeys);

    // if (touchedTones.length > 0) {
    //   handleStartSomeSounds(touchedTones);
    //   handleStopExcepts(touchedTones);
    // } else {
    //   handleStopAllSound();
    // }
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
  } = SoundHandlers;

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
  };

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
  }, []);

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

  const createKeyProps = (index: number, x: number, tone: Tone) => ({
    key: index,
    x,
    y: Padding / 2,
    width: KEY_WIDTH,
    height: KEYBOARD_HEIGHT,
    index,
    tone,
    hover: false,
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
