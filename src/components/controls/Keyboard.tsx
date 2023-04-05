import React from "react";
import Key from "@components/parts/Key";

interface Props {
  width?: number;
  height?: number;
}

const Keyboard = ({ width, height }: Props) => {
  const scale = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5"];
  const Padding = 10;
  const KEYBOARD_WIDTH = (width ? width : 200) + Padding;
  const KEYBOARD_HEIGHT = (height ? height : 100) + Padding;
  return (
    <svg width={KEYBOARD_WIDTH} height={KEYBOARD_HEIGHT}>
      {scale.map((item, index) => (
        <Key color="white" key={index} x={index * 20} y={0}></Key>
      ))}
      {scale.map((item, index) => (
        <Key color="black" key={index} x={index * 20} y={0}></Key>
      ))}
    </svg>
  );
};

export default Keyboard;
