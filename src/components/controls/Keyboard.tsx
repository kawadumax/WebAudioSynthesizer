import React from "react";
import Key from "@components/parts/Key";
import useKeyboardCircuit from "../circuits/KeyboardCircuit";

interface Props {
  width?: number;
  height?: number;
  numOfKeys?: number;
  audioContext: AudioContext;
}

const Keyboard = ({ width, height, numOfKeys = 12 }: Props) => {
  const Padding = 10;
  const SVG_WIDTH = (width ? width : 200) + Padding;
  const SVG_HEIGHT = (height ? height : 100) + Padding;
  const KEYBOARD_WIDTH = width ? width : 200;
  const KEYBOARD_HEIGHT = height ? height : 100;
  const KEY_WIDTH = KEYBOARD_WIDTH / numOfKeys;
  const { wholeTones, naturalTones } = useKeyboardCircuit();

  console.log(wholeTones, naturalTones);
  // keyにhandlerを渡す
  const handleKeyPressed = (tone: number) => {
    console.log(tone);
  };

  const renderWhiteKey = () => {};

  return (
    <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
      {[...Array(numOfKeys)].map((_, index) => (
        <Key
          keyColor="white"
          key={index}
          x={index * KEY_WIDTH + Padding / 2}
          y={Padding / 2}
          width={KEY_WIDTH}
          height={KEYBOARD_HEIGHT}
          index={index}
          onKeyClick={handleKeyPressed}
          // tone={"A"}
        ></Key>
      ))}
      {[...Array(numOfKeys)].map((_, index) => {
        // シドの間とミファの間、一番最後は黒鍵の描画を飛ばす。
        if (index % 7 == 3 || index % 7 == 6 || index == numOfKeys - 1) {
          return;
        }
        return (
          <Key
            keyColor="black"
            key={index}
            x={index * KEY_WIDTH + Padding / 2 + KEY_WIDTH / 2}
            y={Padding / 2}
            width={KEYBOARD_WIDTH / numOfKeys}
            height={KEYBOARD_HEIGHT}
            index={index}
            onKeyClick={handleKeyPressed}
          ></Key>
        );
      })}
    </svg>
  );
};

export default Keyboard;
