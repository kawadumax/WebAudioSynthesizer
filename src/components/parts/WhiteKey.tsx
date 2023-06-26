import React, { forwardRef } from "react";
import { Tone } from "../circuits/TypeCircuit";
import Key from "./Key";

interface Props {
  className?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  tone: Tone;
  // ref: React.Ref<any>;
  onKeyPressed?: (tone: Tone) => void;
  onKeyReleased?: (tone: Tone) => void;
}

// const WhiteKey = forwardRef((props: Props, ref) => {
const WhiteKey = (props: Props) => {
  return (
    <Key
      {...props}
      keyColor="white"
    // ref={ref}
    ></Key>
  );
};

export default WhiteKey;