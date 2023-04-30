import React from "react";
import Key from "@components/parts/Key";
import useKeyboardCircuit from "../circuits/KeyboardCircuit";
import { useAudioContextCircuit } from "../circuits/AudioContextCircuit";

interface Props {
  width?: number;
  height?: number;
  numOfKeys?: number;
  audioContext: AudioContext;
}

const Keyboard = ({ width, height, numOfKeys = 24 }: Props) => {
  const {
    // audioContext,
    // gainNode,
    // oscillatorNode,
    // createAudioContext,
    // closeAudioContext,
    // createOscillator,
    startOscillator,
    stopOscillator,
  } = useAudioContextCircuit();
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

  console.log("KEY_WIDTH: " + KEY_WIDTH);

  // keyにhandlerを渡す
  const handleKeyPressed = (keyOrFreq: string | number, freq?: number) => {
    console.log(keyOrFreq);
    if (freq) console.log(freq);
    if (freq) startOscillator(freq);
  };

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
          <Key
            keyColor="black"
            key={index}
            x={index * KEY_WIDTH + Padding / 2 + KEY_WIDTH / 2}
            y={Padding / 2}
            width={KEY_WIDTH}
            height={KEYBOARD_HEIGHT}
            index={index}
            onKeyPressed={handleKeyPressed}
            toneName={atone.name}
            toneFreq={atone.freq}
          ></Key>
        );
      }
    });
    return result;
  };

  return (
    <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
      {naturalTones.map((tone, index) => (
        <Key
          keyColor="white"
          key={index}
          x={index * KEY_WIDTH + Padding / 2}
          y={Padding / 2}
          width={KEY_WIDTH}
          height={KEYBOARD_HEIGHT}
          index={index}
          onKeyClick={handleKeyPressed}
          toneName={tone.name}
          toneFreq={tone.freq}
        ></Key>
      ))}
      {renderBlackKeys()}
    </svg>
  );
};

export default Keyboard;
