import BlackKey from "@components/parts/BlackKey";
import WhiteKey from "@components/parts/WhiteKey";
import useKeyboardCircuit, {
  useKeyboardContext,
} from "../circuits/KeyboardCircuit";
import { Tone } from "../circuits/TypeCircuit";
import { useEffect, useRef } from "react";
import { useAudioContextCircuit } from "../circuits/AudioContextCircuit";

interface Props {
  width?: number;
  height?: number;
  numOfKeys?: number;
}

const Keyboard = ({ width, height, numOfKeys = 24 }: Props) => {
  const { soundStates, startOscillator, stopOscillator } = useAudioContextCircuit();
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

  // const handleTouchMove: React.TouchEventHandler<SVGSVGElement> = (event) => {
  const handleTouchMove = (event: TouchEvent) => {
    event.preventDefault();
    //TODO
    // console.log("Touch Moved: ", event);
    // 各鍵盤のどの領域にあるのかを判定する。
    //// 現在の指の座標を取得する。
    const cord = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    // console.log(cord);
    //// すべての鍵を走査して指の座標があるかを調べる？ OR 計算でどのキー上にあるのかを求める
    //////キーボードの上端と下端を取得する
    if (refSVG.current == null) {
      return;
    }
    const keyBoardRect = refSVG.current.getBoundingClientRect();
    const topKeyboard = keyBoardRect.top;
    const bottomKeyboard = keyBoardRect.bottom;
    //////キーボードの左端と右端を取得する
    const leftKeyboard = keyBoardRect.left;
    const rightKeyboard = keyBoardRect.right;
    //////キーの分割数を取得する numOfKeys
    //////キーボードの範囲内にないとき、早期リターン
    if (
      cord.x < leftKeyboard ||
      cord.x > rightKeyboard ||
      cord.y > bottomKeyboard ||
      cord.y < topKeyboard
    ) {
      console.log("Touch is not in keyboard", cord, keyBoardRect);
      return;
    }

    const toBeStop = soundStates.filter(s => s.tone.name !== touchedTone.name);
    console.log("want to stop: ", soundStates, toBeStop);
    for (const state of toBeStop) {
      stopOscillator(state.tone);
    }

    //////キーボードの範囲内にあるとき、キーの左から何番目にあるのかを取得する
    // console.log("Touch is in keyboard", cord, keyBoardRect);
    const touchedKeyOrder = Math.floor(cord.x / KEY_WIDTH);
    const touchedTone = naturalTones[touchedKeyOrder];
    startOscillator(touchedTone);
    // 指がないのに鳴ってるキーがあったら止める。


  };

  const handleTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    console.log("Touch Start: ", event);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault();
    // stopOscillator();
    console.log("Touch End: ", event);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleKeyPressed);
    document.addEventListener("mouseup", handleKeyReleased);
    //event.preventDefault()と{ passive: false }の組み合わせでスクロールも無効化できる。
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("mousedown", handleKeyPressed);
      document.removeEventListener("mouseup", handleKeyReleased);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchstart", handleTouchStart);
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

    naturalTones.forEach((ntone, index, naturalTones) => {
      if (
        ntone.name.includes("E") ||
        ntone.name.includes("B") ||
        index === naturalTones.length - 1
      ) {
        result.push(null);
        return;
      }
      const atone = accidentalTones.shift();
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
      height={SVG_HEIGHT}
      viewBox={"0 0 " + SVG_WIDTH + " " + SVG_HEIGHT}
      ref={refSVG}
    >
      {renderWhiteKeys()}
      {renderBlackKeys()}
    </svg>
  );
};

export default Keyboard;
