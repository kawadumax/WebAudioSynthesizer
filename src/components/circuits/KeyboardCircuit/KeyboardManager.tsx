import {
  containsPoint,
  mapToDOMRects,
  Point,
  splitArray,
  findRectIndex,
} from "@/modules/utils/DomUtils";
import WhiteKey from "@/components/parts/WhiteKey";
import BlackKey from "@/components/parts/BlackKey";
import { Tone } from "@/modules/Type";
import { makeSequencedKeys } from "./KeyboardCircuit";

import { useState, useRef, useEffect } from "react";

interface KeyProps {
  key: number;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  tone: Tone;
  hover: boolean;
}

interface Constants {
  PADDING: number;
  KEYBOARD_WIDTH: number;
  KEYBOARD_HEIGHT: number;
  KEY_WIDTH: number;
}

const useKeyboardManager = (startIndex: number, endIndex: number, width: number, height: number) => {

  const keys = makeSequencedKeys(startIndex, endIndex);
  const [accidentalTones, setAccidentalTones] = useState<Tone[]>(keys.rangedAccidentalTones);
  const [naturalTones, setNaturalTones] = useState<Tone[]>(keys.rangedNaturalTones);
  const [wholeTones, setWholeTones] = useState<Tone[]>(keys.rangedWholeTones);

  const constantsRef = useRef<Constants>((() => {
    const PADDING = 10;
    const KEYBOARD_WIDTH = width || 200;
    const KEYBOARD_HEIGHT = height || 100;
    const SVG_WIDTH = KEYBOARD_WIDTH + PADDING;
    const SVG_HEIGHT = KEYBOARD_HEIGHT + PADDING;
    return {
      PADDING,
      SVG_WIDTH,
      SVG_HEIGHT,
      KEYBOARD_WIDTH,
      KEYBOARD_HEIGHT,
      KEY_WIDTH: (width || 200) / keys.rangedNaturalTones.length,
    }
  })());

  const createKeyProps = (index: number, x: number, tone: Tone): KeyProps => ({
    key: index,
    x,
    y: constantsRef.current.PADDING / 2,
    width: constantsRef.current.KEY_WIDTH,
    height: constantsRef.current.KEYBOARD_HEIGHT,
    index,
    tone,
    hover: false,
  });

  const renderWhiteKeys = (): JSX.Element[] =>
    naturalTones.map((tone, index) => (
      <WhiteKey {...createKeyProps(index, index * constantsRef.current.KEY_WIDTH + constantsRef.current.PADDING / 2, tone)} />
    ));

  const renderBlackKeys = (): JSX.Element[] => {
    const result: Array<JSX.Element> = [];
    const accidentalTonesCopy = [...accidentalTones];

    naturalTones.forEach((ntone, index, naturalTones) => {
      if (
        ntone.name.includes("E") ||
        ntone.name.includes("B") ||
        index === naturalTones.length - 1
      ) {
        // result.push(null); //どうせrenderされないならnullを入れなくてもいいのではないか説
        return;
      }
      const atone = accidentalTonesCopy.shift();
      if (atone) {
        result.push(
          <BlackKey
            {...createKeyProps(
              index,
              index * constantsRef.current.KEY_WIDTH + constantsRef.current.PADDING / 2 + constantsRef.current.KEY_WIDTH / 2,
              atone
            )}
          ></BlackKey>
        );
      }
    });
    return result;
  };

  const [whiteKeyElements, setWhiteKeyElements] = useState<JSX.Element[]>([]);
  const [blackKeyElements, setBlackKeyElements] = useState<JSX.Element[]>([]);

  const getTone = (
    position: Point
  ): Tone | undefined => {
    return (
      getBlackTone(position) || getWhiteTone(position)
    );
  };

  const getBlackTone = (
    position: Point
  ): Tone | undefined => {
    if (position.y > blackKeyElements[0].props.) {
      return;
    }

    const touchedKeyIndex = blackKeyRects.findIndex((rect) => {
      return containsPoint(rect, position);
    });

    return accidentalTones[touchedKeyIndex];
  };

  const getWhiteTone = (
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

  //   public getTones = (position: Point): Tone | undefined => {
  //     const keyboardSVG = refSVG.current;
  //     if (
  //       keyboardSVG &&
  //       containsPoint(keyboardSVG.getBoundingClientRect(), position)
  //     ) {
  //       return (
  //         getBlackTones(keyboardSVG, position) ||
  //         getWhiteTones(keyboardSVG, position)
  //       );
  //     }
  //   };

  //   public getBlackTones = (
  //     svg: SVGSVGElement,
  //     position: Point
  //   ): Tone | undefined => {
  //     const keys = svg.children;
  //     const keyRects = Array.from(keys).map((key) => key.getBoundingClientRect());
  //     const blackKeyRects = keyRects.slice(naturalTones.length);
  //     if (position.y > blackKeyRects[0].bottom) {
  //       //タッチのy座標がキーボードの下半分にあるとき、早期リターン
  //       return;
  //     }

  //     const touchedKeyIndex = blackKeyRects.findIndex((rect) => {
  //       return containsPoint(rect, position);
  //     });

  //     return accidentalTones[touchedKeyIndex];
  //   };

  //   public getWhiteTones = (
  //     svg: SVGSVGElement,
  //     position: Point
  //   ): Tone | undefined => {
  //     const keyboardRect = svg.getBoundingClientRect();
  //     const scaledWhiteKeyWidth = keyboardRect.width / naturalTones.length;
  //     // タッチの座標が各鍵盤のどの領域にあるのかを判定する。
  //     const touchedKeyOrder = Math.floor(
  //       (position.x - keyboardRect.left) / scaledWhiteKeyWidth
  //     );
  //     return naturalTones[touchedKeyOrder];
  //   };

  //   public getKeyIndexes = (keys: HTMLCollection, points: Point[]): number[] => {
  //     const keyRects = mapToDOMRects(keys);
  //     const [whiteKeyRects, blackKeyRects] = splitArray(
  //       keyRects,
  //       naturalTones.length
  //     );

  //     const touchedKeyIndexes = points
  //       .map((point) => {
  //         return (
  //           findRectIndex(blackKeyRects, point) ||
  //           findRectIndex(whiteKeyRects, point)
  //         );
  //       })
  //       .filter((index) => index !== undefined) as number[];
  //     if (!touchedKeyIndexes) return [];
  //     return touchedKeyIndexes;
  //   };

  useEffect(() => {
    setWhiteKeyElements(renderWhiteKeys());
    setBlackKeyElements(renderBlackKeys());
  }, [naturalTones, accidentalTones, constantsRef.current]);


  return {
    whiteKeyElements,
    blackKeyElements,
  };
};

export default useKeyboardManager;