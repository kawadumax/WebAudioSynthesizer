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

import { useState, useRef } from "react";

// class KeyBoardManager {
//   protected readonly wholeTones: Tone[];
//   protected readonly naturalTones: Tone[];
//   protected readonly accidentalTones: Tone[];
//   protected readonly whiteKeyElements: JSX.Element[];
//   protected readonly blackKeyElements: JSX.Element[];
//   // protected readonly wholeKeyElements: JSX.Element[];
//   protected readonly constants;

//   private createKeyProps = (index: number, x: number, tone: Tone) => ({
//     key: index,
//     x,
//     y: this.constants.PADDING / 2,
//     width: this.constants.KEY_WIDTH,
//     height: this.constants.KEYBOARD_HEIGHT,
//     index,
//     tone,
//     hover: false,
//   });

//   private renderWhiteKeys = () => {
//     return this.naturalTones.map((tone, index) => (
//       <WhiteKey
//         {...this.createKeyProps(index, index * this.constants.KEY_WIDTH + this.constants.PADDING / 2, tone)}
//       ></WhiteKey>
//     ));
//   };

//   private renderBlackKeys = () => {
//     const result: Array<JSX.Element> = [];
//     const accidentalTonesCopy = [...this.accidentalTones];

//     this.naturalTones.forEach((ntone, index, naturalTones) => {
//       if (
//         ntone.name.includes("E") ||
//         ntone.name.includes("B") ||
//         index === naturalTones.length - 1
//       ) {
//         // result.push(null); //どうせrenderされないならnullを入れなくてもいいのではないか説
//         return;
//       }
//       const atone = accidentalTonesCopy.shift();
//       if (atone) {
//         result.push(
//           <BlackKey
//             {...this.createKeyProps(
//               index,
//               index * this.constants.KEY_WIDTH + this.constants.PADDING / 2 + this.constants.KEY_WIDTH / 2,
//               atone
//             )}
//           ></BlackKey>
//         );
//       }
//     });
//     return result;
//   };

//   constructor(startIndex: number, endIndex: number, width: number, height: number) {
//     const keys = makeSequencedKeys(startIndex, endIndex);
//     this.accidentalTones = keys.rangedAccidentalTones;
//     this.naturalTones = keys.rangedNaturalTones;
//     this.wholeTones = keys.rangedWholeTones;

//     //定数値
//     const PADDING = 10;
//     const KEYBOARD_WIDTH = width ? width : 200;
//     const KEYBOARD_HEIGHT = height ? height : 100;
//     this.constants = {
//       PADDING,
//       SVG_WIDTH: (width ? width : 200) + PADDING,
//       SVG_HEIGHT: (height ? height : 100) + PADDING,
//       KEYBOARD_WIDTH,
//       KEYBOARD_HEIGHT,
//       KEY_WIDTH: KEYBOARD_WIDTH / this.naturalTones.length
//     }

//     this.whiteKeyElements = this.renderWhiteKeys();
//     this.blackKeyElements = this.renderBlackKeys();
//   }

//   public getTone = (
//     position: Point
//   ): Tone | undefined => {
//     return (
//       this.getBlackTone(position) || this.getWhiteTone(position)
//     );
//   };

//   public getBlackTone = (
//     position: Point
//   ): Tone | undefined => {
//     if (position.y > this.blackKeyElements[0].) {
//       //タッチのy座標がキーボードの下半分にあるとき、早期リターン
//       return;
//     }

//     const touchedKeyIndex = blackKeyRects.findIndex((rect) => {
//       return containsPoint(rect, position);
//     });

//     return accidentalTones[touchedKeyIndex];
//   };

//   public getWhiteTone = (
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
// }

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
  // ... makeSequencedKeys などの必要な関数や型がインポートされていると仮定

  const keys = makeSequencedKeys(startIndex, endIndex);
  const [accidentalTones, setAccidentalTones] = useState<Tone[]>(keys.rangedAccidentalTones);
  const [naturalTones, setNaturalTones] = useState<Tone[]>(keys.rangedNaturalTones);
  const [wholeTones, setWholeTones] = useState<Tone[]>(keys.rangedWholeTones);

  const constantsRef = useRef<Constants>({
    PADDING: 10,
    KEYBOARD_WIDTH: width || 200,
    KEYBOARD_HEIGHT: height || 100,
    KEY_WIDTH: (width || 200) / keys.rangedNaturalTones.length,
  });

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
    // ... ここに実装を追加
    return []; // 仮の返り値
  };

  const [whiteKeyElements, setWhiteKeyElements] = useState<JSX.Element[]>([]);
  const [blackKeyElements, setBlackKeyElements] = useState<JSX.Element[]>([]);

  useEffect(() => {
    setWhiteKeyElements(renderWhiteKeys());
    setBlackKeyElements(renderBlackKeys());
    // Dependencies should be the values used inside renderWhiteKeys and renderBlackKeys
  }, [naturalTones, accidentalTones, constantsRef.current]);

  // ... その他の関数をここに追加

  return {
    getTone: (position: Point): Tone | undefined => {
      // ... 実装を追加
      return undefined; // 仮の返り値
    },
    // ... その他の公開する関数や状態
    whiteKeyElements,
    blackKeyElements,
  };
};

export default useKeyboardManager;