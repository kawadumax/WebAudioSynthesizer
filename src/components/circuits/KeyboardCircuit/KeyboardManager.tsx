import { Point, findIndexByPoint } from "@/modules/utils/DomUtils";
import WhiteKey from "@/components/parts/WhiteKey";
import BlackKey from "@/components/parts/BlackKey";
import { Tone } from "@/modules/Type";
import { makeSequencedKeys } from "./KeyboardCircuit";

import React, {
  useState,
  useRef,
  useEffect,
  Ref,
  createRef,
  RefObject,
} from "react";

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
  SVG_WIDTH: number;
  SVG_HEIGHT: number;
}

const useKeyboardManager = (
  startIndex: number,
  endIndex: number,
  width: number,
  height: number
) => {
  const keys = makeSequencedKeys(startIndex, endIndex);
  const [accidentalTones, setAccidentalTones] = useState<Tone[]>(
    keys.rangedAccidentalTones
  );
  const [naturalTones, setNaturalTones] = useState<Tone[]>(
    keys.rangedNaturalTones
  );
  const [wholeTones, setWholeTones] = useState<Tone[]>(keys.rangedWholeTones);

  const constantsRef = useRef<Constants>(
    (() => {
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
      };
    })()
  );

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

  const renderWhiteKeys = (whiteKeyRefs: Ref<SVGGElement>[]): JSX.Element[] =>
    whiteKeyRefs.map((ref, index) => (
      <WhiteKey
        {...createKeyProps(
          index,
          index * constantsRef.current.KEY_WIDTH +
            constantsRef.current.PADDING / 2,
          naturalTones[index]
        )}
        ref={ref}
      />
    ));

  function calculateKeyPosition(index: number) {
    // キーの位置を計算するためのユーティリティ関数
    return (
      index * constantsRef.current.KEY_WIDTH +
      constantsRef.current.PADDING / 2 +
      constantsRef.current.KEY_WIDTH / 2
    );
  }

  const renderBlackKeys = (blackKeyRefs: Ref<SVGGElement>[]): JSX.Element[] => {
    // 結果の JSX.Element 配列
    const result: Array<JSX.Element> = [];

    // 黒鍵をレンダリングする必要のある音符のインデックスを取得
    const blackKeyIndices = naturalTones
      .map((ntone, index) =>
        ntone.name.includes("E") || ntone.name.includes("B") ? -1 : index
      )
      .filter((index) => index !== -1);

    // 必要な黒鍵の数だけループして JSX.Element を生成
    for (const [i, index] of blackKeyIndices.entries()) {
      const keyProps = createKeyProps(
        index,
        calculateKeyPosition(index),
        accidentalTones[index]
      );

      result.push(<BlackKey {...keyProps} ref={blackKeyRefs[i]}></BlackKey>);
    }

    return result;
  };

  const [whiteKeyElements, setWhiteKeyElements] = useState<JSX.Element[]>([]);
  const [blackKeyElements, setBlackKeyElements] = useState<JSX.Element[]>([]);

  const [whiteKeyRefs, setWhiteKeyRefs] = useState<RefObject<SVGGElement>[]>(
    []
  );
  const [blackKeyRefs, setBlackKeyRefs] = useState<RefObject<SVGGElement>[]>(
    []
  );

  const getTone = (position: Point): Tone | undefined => {
    return getBlackTone(position) || getWhiteTone(position);
  };

  const getBlackTone = (position: Point): Tone | undefined => {
    const touchedKeyIndex = findIndexByPoint(blackKeyRefs, position);
    if (touchedKeyIndex !== undefined) return accidentalTones[touchedKeyIndex];
  };

  const getWhiteTone = (position: Point): Tone | undefined => {
    const touchedKeyIndex = findIndexByPoint(whiteKeyRefs, position);
    if (touchedKeyIndex !== undefined) return naturalTones[touchedKeyIndex];
  };

  const getTonesByPoints = (points: Point[]): Tone[] => {
    return points
      .map((point) => getTone(point))
      .filter((tone): tone is Tone => tone !== undefined);
  };

  const getBlackTonesByIndexes = (indexes: number[]): Tone[] => {
    return accidentalTones.filter((t, index) => indexes.includes(index));
  };

  const getWhiteTonesByIndexes = (indexes: number[]): Tone[] => {
    return naturalTones.filter((t, index) => indexes.includes(index));
  };

  const getKeyIndexes = (points: Point[]) => {
    //TODO whiteが取得できていない
    //各pointごとに、最初にblackに属するかを確認し、そうであればindexを確認し、black配列いれる。
    //そうでなければwhiteに属するかを見て、属するのであればindexを確認しwhite配列に入れる。
    let blackRefsIndexes = [];
    let whiteRefsIndexes = [];

    for (const point of points) {
      let foundIndex = findIndexByPoint(blackKeyRefs, point);
      if (foundIndex >= 0) {
        blackRefsIndexes.push(foundIndex);
      } else {
        foundIndex = findIndexByPoint(whiteKeyRefs, point);
        if (foundIndex === -1) continue;
        whiteRefsIndexes.push(foundIndex);
      }
    }

    return { blackRefsIndexes, whiteRefsIndexes };
  };

  const getKeyElementsByRefIndexes = (
    blackIndexes: number[],
    whiteIndexes: number[]
  ) => {
    const blackElements = blackIndexes.map(
      (index) => blackKeyRefs[index].current
    );
    const whiteElements = whiteIndexes.map(
      (index) => whiteKeyRefs[index].current
    );
    return [...blackElements, ...whiteElements];
  };

  useEffect(() => {
    const whiteKeyRefs = naturalTones.map((t) => createRef<SVGGElement>());
    const blackKeyRefs = accidentalTones.map((t) => createRef<SVGGElement>());
    setWhiteKeyElements(renderWhiteKeys(whiteKeyRefs));
    setBlackKeyElements(renderBlackKeys(blackKeyRefs));
    setWhiteKeyRefs(whiteKeyRefs);
    setBlackKeyRefs(blackKeyRefs);
  }, [naturalTones, accidentalTones, constantsRef.current]);

  return {
    whiteKeyElements,
    blackKeyElements,
    whiteKeyRefs,
    blackKeyRefs,
    constantsRef,
    wholeTones,
    accidentalTones,
    naturalTones,
    getTone,
    getTonesByPoints,
    getBlackTonesByIndexes,
    getWhiteTonesByIndexes,
    getKeyIndexes,
    getKeyElementsByRefIndexes,
  };
};

export default useKeyboardManager;
