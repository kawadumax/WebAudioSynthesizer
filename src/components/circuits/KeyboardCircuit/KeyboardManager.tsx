import {
  createRef,
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import BlackKey from "@/components/parts/BlackKey";
import WhiteKey from "@/components/parts/WhiteKey";
import type { Tone } from "@/modules/Type";
import { findIndexByPoint, type Point } from "@/modules/utils/DomUtils";
import { makeSequencedKeys } from "./KeyboardCircuit";

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
  height: number,
) => {
  const keys = makeSequencedKeys(startIndex, endIndex);
  const [accidentalTones, _setAccidentalTones] = useState<Tone[]>(keys.rangedAccidentalTones);
  const [naturalTones, _setNaturalTones] = useState<Tone[]>(keys.rangedNaturalTones);
  const [wholeTones, _setWholeTones] = useState<Tone[]>(keys.rangedWholeTones);

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
    })(),
  );

  const createKeyProps = useCallback(
    (index: number, x: number, tone: Tone): KeyProps => ({
      key: index,
      x,
      y: constantsRef.current.PADDING / 2,
      width: constantsRef.current.KEY_WIDTH,
      height: constantsRef.current.KEYBOARD_HEIGHT,
      index,
      tone,
      hover: false,
    }),
    [],
  );

  const renderWhiteKeys = useCallback(
    (whiteKeyRefs: Ref<SVGGElement>[]): JSX.Element[] =>
      whiteKeyRefs.map((ref, index) => (
        <WhiteKey
          key={`white-key-${naturalTones[index]?.name ?? index}`}
          {...createKeyProps(
            index,
            index * constantsRef.current.KEY_WIDTH + constantsRef.current.PADDING / 2,
            naturalTones[index],
          )}
          ref={ref}
        />
      )),
    [createKeyProps, naturalTones],
  );

  const calculateKeyPosition = useCallback((index: number) => {
    return (
      index * constantsRef.current.KEY_WIDTH +
      constantsRef.current.PADDING / 2 +
      constantsRef.current.KEY_WIDTH / 2
    );
  }, []);

  const renderBlackKeys = useCallback(
    (blackKeyRefs: Ref<SVGGElement>[]): JSX.Element[] => {
      const result: Array<JSX.Element> = [];
      const blackKeyIndices = naturalTones
        .map((ntone, index) => (ntone.name.includes("E") || ntone.name.includes("B") ? -1 : index))
        .filter((index) => index !== -1);

      for (const [i, index] of blackKeyIndices.entries()) {
        const tone = accidentalTones[index];
        const keyProps = createKeyProps(index, calculateKeyPosition(index), tone);

        result.push(
          <BlackKey key={`black-key-${tone?.name ?? index}`} {...keyProps} ref={blackKeyRefs[i]} />,
        );
      }

      return result;
    },
    [accidentalTones, calculateKeyPosition, createKeyProps, naturalTones],
  );

  const [whiteKeyElements, setWhiteKeyElements] = useState<JSX.Element[]>([]);
  const [blackKeyElements, setBlackKeyElements] = useState<JSX.Element[]>([]);

  const [whiteKeyRefs, setWhiteKeyRefs] = useState<RefObject<SVGGElement>[]>([]);
  const [blackKeyRefs, setBlackKeyRefs] = useState<RefObject<SVGGElement>[]>([]);

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
    return points.map((point) => getTone(point)).filter((tone): tone is Tone => tone !== undefined);
  };

  const getBlackTonesByIndexes = (indexes: number[]): Tone[] => {
    return accidentalTones.filter((_t, index) => indexes.includes(index));
  };

  const getWhiteTonesByIndexes = (indexes: number[]): Tone[] => {
    return naturalTones.filter((_t, index) => indexes.includes(index));
  };

  const getKeyIndexes = (points: Point[]) => {
    //各pointごとに、最初にblackに属するかを確認し、そうであればindexを確認し、black配列いれる。
    //そうでなければwhiteに属するかを見て、属するのであればindexを確認しwhite配列に入れる。
    const blackRefsIndexes = [];
    const whiteRefsIndexes = [];

    for (const point of points) {
      // ポイントが黒鍵のインデックスに該当するか調べる
      const blackIndex = findIndexByPoint(blackKeyRefs, point);
      if (blackIndex !== -1) {
        blackRefsIndexes.push(blackIndex);
        continue; // 黒鍵が見つかれば次のポイントへ
      }

      // ポイントが白鍵のインデックスに該当するか調べる
      const whiteIndex = findIndexByPoint(whiteKeyRefs, point);
      if (whiteIndex !== -1) {
        whiteRefsIndexes.push(whiteIndex);
      }
    }

    return { blackRefsIndexes, whiteRefsIndexes };
  };

  const getKeyElementsByRefIndexes = (
    blackIndexes: number[],
    whiteIndexes: number[],
  ): SVGGElement[] => {
    const blackElements = blackIndexes.map((index) => blackKeyRefs[index].current);
    const whiteElements = whiteIndexes.map((index) => whiteKeyRefs[index].current);
    return [...blackElements, ...whiteElements].filter((elm): elm is SVGGElement => elm !== null);
  };

  useEffect(() => {
    const whiteKeyRefs = naturalTones.map((_t) => createRef<SVGGElement>());
    const blackKeyRefs = accidentalTones.map((_t) => createRef<SVGGElement>());
    setWhiteKeyElements(renderWhiteKeys(whiteKeyRefs));
    setBlackKeyElements(renderBlackKeys(blackKeyRefs));
    setWhiteKeyRefs(whiteKeyRefs);
    setBlackKeyRefs(blackKeyRefs);
  }, [naturalTones, accidentalTones, renderBlackKeys, renderWhiteKeys]);

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
