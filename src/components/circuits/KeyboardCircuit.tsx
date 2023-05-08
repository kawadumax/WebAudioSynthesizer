import { useContext, useState, createContext } from "react";
import { Tone } from "./TypeCircuit";
import { useAudioContextCircuit } from "../circuits/AudioContextCircuit";

interface Props {
  children: React.ReactNode;
}

interface KeyboardCircuitContext {
  isKeyPressed: boolean;
  setIsKeyPressed: React.Dispatch<React.SetStateAction<boolean>>;
}

const KeyboardContext = createContext<KeyboardCircuitContext | null>(null);

const useKeyboardCircuit = () => {
  const { startOscillator, stopOscillator } = useAudioContextCircuit();
  const toneNumberToFreq = (tone: number) => {
    //1オクターブで周波数が2倍なので、半音上がると2の十二乗根倍になる。
    //これを元に、48番目の音階であるA4=440hzを基準として計算で周波数を求める。
    return standardTuningPitch.A4 * Math.exp(((tone - 48) / 12) * Math.log(2));
  };

  const toneNamesSharp = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
  ];
  const toneNamesFlat = [
    "A",
    "Bb",
    "B",
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
  ];
  const octaves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const allToneNames = octaves.flatMap((octave) =>
    toneNamesSharp.map((tone) => tone + octave)
  );
  const standardTuningPitch = { A4: 440 };
  // const aPitches = { A3: 220, A2: 110, A1: 55, A0: 27.5 };
  // const minPitch = { A0: standardTuningPitch["A4"] / 16 };

  const wholeTones: Tone[] = allToneNames.map((tone, index) => {
    return {
      name: tone,
      freq: toneNumberToFreq(index),
    };
  });

  const wholeNaturalTones = wholeTones.filter((tone) => {
    return tone.name.length < 3;
  });

  const wholeAccidentalTones = wholeTones.filter((tone) => {
    return tone.name.length >= 3;
  });

  const makeSequencedKeys = (startIndex: number, endIndex: number) => {
    const rangedWholeTones = wholeTones.slice(startIndex, endIndex);

    const naturalTones = rangedWholeTones.filter((tone) => {
      return tone.name.length < 3;
    });

    const accidentalTones = rangedWholeTones.filter((tone) => {
      return tone.name.length >= 3;
    });
    return { wholeTones, naturalTones, accidentalTones };
  };

  const [isKeyPressed, setIsKeyPressed] = useState(false);

  const handleStartSound = (tone: Tone) => {
    startOscillator(tone);
  };

  const handleStopSound = (tone: Tone) => {
    stopOscillator(tone);
  };

  return {
    isKeyPressed,
    setIsKeyPressed,
    makeSequencedKeys,
    handleStartSound,
    handleStopSound,
  };
};

export const KeyboardContextProvider = ({ children }: Props) => {
  const { isKeyPressed, setIsKeyPressed } = useKeyboardCircuit();
  const keyboardState = { isKeyPressed, setIsKeyPressed };
  return (
    <KeyboardContext.Provider value={keyboardState}>
      {children}
    </KeyboardContext.Provider>
  );
};

export const useKeyboardContext = () => useContext(KeyboardContext);

export default useKeyboardCircuit;
