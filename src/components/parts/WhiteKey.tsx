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
  onKeyPressed?: (tone: Tone) => void;
  onKeyReleased?: (tone: Tone) => void;
}

const WhiteKey = (props
: Props) => {
  return (
    <Key
    {...props}
    keyColor="white"
    ></Key>
  );
};

export default WhiteKey;