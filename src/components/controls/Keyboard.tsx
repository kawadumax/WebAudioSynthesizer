import BlackKey from "@components/parts/BlackKey";
import WhiteKey from "@components/parts/WhiteKey";
import useKeyboardCircuit, {
  useKeyboardContext,
} from "../circuits/KeyboardCircuit";
import { Tone } from "../circuits/TypeCircuit";
import { useEffect, useRef } from "react";
import { useAudioContextCircuit } from "../circuits/AudioContextCircuit";
import { containsPoint } from '@utils/DomUtils';

interface Props {
  width?: number;
  height?: number;
  numOfKeys?: number;
}

const Keyboard = ({ width, height, numOfKeys = 24 }: Props) => {
  const { startOscillator, stopOscillatorAll, stopOscillatorExcept } =
    useAudioContextCircuit();
  const keyboardContext = useKeyboardContext();
  const refSVG = useRef<SVGSVGElement>(null);

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
    setIsKeyPressed(true);
  };

  const handleKeyReleased = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    setIsKeyPressed(false);
  };

  const handleTouchStartAndMove = (event: TouchEvent) => {
    event.preventDefault();
    if (refSVG.current == null) {
      return;
    }
    // 各鍵盤のどの領域にあるのかを判定する。
    //// 現在のタッチの座標を取得する。
    const position = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    ////計算でどのキー上にあるのかを求める
    const keyBoardRect = refSVG.current.getBoundingClientRect();
    //////キーボードの範囲内にないとき、早期リターン
    if (!containsPoint(keyBoardRect, position)) {
      stopOscillatorAll();
      return;
    }

    //////キーボードの範囲内にあるとき、キーの左から何番目にあるのかを取得する
    const keys = refSVG.current.children;
    const keyRectList = Array.from(keys).map((key) => key.getBoundingClientRect())
    const blackKeyRectList = keyRectList.slice(naturalTones.length);
    //最初に黒鍵に当てはまるのかを確かめる
    if (position.y <= blackKeyRectList[0].bottom) {
      //タッチのy座標がキーボードの黒鍵の領域より上にあるとき
      const touchedKeyIndex = blackKeyRectList.findIndex((rect) => {
        return containsPoint(rect, position)
      });
      if (touchedKeyIndex >= 0) {
        const touchedTone = accidentalTones[touchedKeyIndex];
        startAndStopExcept(touchedTone);
        //黒鍵がタッチされていたら処理を終了。
        return;
      }
    }

    //白鍵
    const scaledWhiteKeyWidth = keyBoardRect.width / naturalTones.length;
    const touchedKeyOrder = Math.floor((position.x - keyBoardRect.left) / scaledWhiteKeyWidth);
    const touchedTone = naturalTones[touchedKeyOrder];
    startAndStopExcept(touchedTone);

  };

  const startAndStopExcept = (touchedTone: Tone) => {
    if (touchedTone) {
      startOscillator(touchedTone);
      // 指がないのに鳴ってるキーがあったら止める。
      stopOscillatorExcept(touchedTone);
    }
  };

  const handleTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    // console.log("Touch Start: ", event);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault();
    stopOscillatorAll();
    // console.log("Touch End: ", event);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleKeyPressed);
    document.addEventListener("mouseup", handleKeyReleased);
    //event.preventDefault()と{ passive: false }の組み合わせでスクロールも無効化できる。
    document.addEventListener("touchmove", handleTouchStartAndMove, { passive: false });
    document.addEventListener("touchstart", handleTouchStartAndMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("mousedown", handleKeyPressed);
      document.removeEventListener("mouseup", handleKeyReleased);
      document.removeEventListener("touchmove", handleTouchStartAndMove);
      document.removeEventListener("touchstart", handleTouchStartAndMove);
      document.removeEventListener("touchend", handleTouchEnd);
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
