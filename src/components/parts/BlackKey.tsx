import { Tone } from "@/modules/Type";
import Key from "./Key";

interface Props {
  className?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  tone: Tone;
  onKeyPressed?: (tone: Tone) => void;
  onKeyReleased?: (tone: Tone) => void;
}

const BlackKey = (props: Props) => {
  return <Key {...props} keyColor="black"></Key>;
};

export default BlackKey;
