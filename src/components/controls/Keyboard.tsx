import React from "react";
import Key from "@components/parts/Key";

interface Props {
  width?: number;
  height?: number;
  numOfKeys?: number;
}

const Keyboard = ({ width, height, numOfKeys = 12 }: Props) => {
  const Padding = 10;
  const KEYBOARD_WIDTH = (width ? width : 200) + Padding;
  const KEYBOARD_HEIGHT = (height ? height : 100) + Padding;
  return (
    <svg width={KEYBOARD_WIDTH} height={KEYBOARD_HEIGHT}>
      {[...Array(numOfKeys)].map((_, index) => (
        <Key
          color="white"
          key={index}
          x={index * 20 + Padding / 2}
          y={Padding / 2}
        ></Key>
      ))}
      {[...Array(numOfKeys)].map((_, index) => {
        // シドの間とミファの間、一番最後は黒鍵の描画を飛ばす。
        if (index % 7 == 3 || index % 7 == 6 || index == numOfKeys - 1) {
          return;
        }
        return (
          <Key
            color="black"
            key={index}
            x={index * 20 + Padding / 2 + 10}
            y={Padding / 2}
          ></Key>
        );
      })}
    </svg>
  );
};

export default Keyboard;
