import BlackKey from "@components/parts/BlackKey";
import WhiteKey from "@components/parts/WhiteKey";
import useKeyboardCircuit from "../circuits/KeyboardCircuit";
import { useAudioContextCircuit } from "../circuits/AudioContextCircuit";
import { Tone } from "../circuits/TypeCircuit";

interface Props {
  width?: number;
  height?: number;
  numOfKeys?: number;
}

const Keyboard = ({ width, height, numOfKeys = 24 }: Props) => {
  const { startOscillator, stopOscillator } = useAudioContextCircuit();
  const { makeSequencedKeys } = useKeyboardCircuit();
  const startKey = 44;
  const endKey = startKey + numOfKeys;
  const { wholeTones, naturalTones, accidentalTones } = makeSequencedKeys(
    startKey,
    endKey
  );

  const Padding = 10;
  const SVG_WIDTH = (width ? width : 200) + Padding;
  const SVG_HEIGHT = (height ? height : 100) + Padding;
  const KEYBOARD_WIDTH = width ? width : 200;
  const KEYBOARD_HEIGHT = height ? height : 100;
  const KEY_WIDTH = KEYBOARD_WIDTH / naturalTones.length;

  const handleKeyPressed = (tone: Tone) => {
    console.log("Pressed: ", { ...tone });
    startOscillator(tone);
  };

  const handleKeyReleased = (tone: Tone) => {
    console.log("Released: ", { ...tone });
    stopOscillator(tone);
  };

  const createKeyProps = (
    index: number,
    x: number,
    tone: Tone,
  ) => ({
    key: index,
    x,
    y: Padding / 2,
    width: KEY_WIDTH,
    height: KEYBOARD_HEIGHT,
    index,
    onKeyPressed: handleKeyPressed,
    onKeyReleased: handleKeyReleased,
    tone,
  });

  const renderWhiteKeys = () =>{
    return naturalTones.map((tone, index) => (
      <WhiteKey
        {...createKeyProps(index, index * KEY_WIDTH + Padding / 2, tone)}
      ></WhiteKey>
    ))
  }

  const renderBlackKeys = () => {
    const result: Array<JSX.Element | null> = [];

    naturalTones.forEach((ntone, index, naturalTones) => {
      if (
        ntone.name.includes("E") ||
        ntone.name.includes("B") ||
        index == naturalTones.length - 1
      ) {
        result.push(null);
        return;
      }
      const atone = accidentalTones.shift();
      if (atone) {
        result.push(
          <BlackKey
            {...createKeyProps(index, index * KEY_WIDTH + Padding / 2 + KEY_WIDTH / 2, atone)}
          ></BlackKey>
        );
      }
    });
    return result;
  };

  return (
    <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
      {renderWhiteKeys()}
      {renderBlackKeys()}
    </svg>
  );
};

export default Keyboard;
