import React from "react";
import type { Tone } from "@/modules/AudioEngine/types";
import Key from "./Key";

interface Props {
  className?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  tone: Tone;
  hover?: boolean;
}

const WhiteKey = React.forwardRef<SVGGElement, Props>((props: Props, ref) => {
  return <Key ref={ref} {...props} keyColor="white"></Key>;
});

export default WhiteKey;
