import { Tone } from "@/modules/Type";
import { useApplicationContext } from "../AudioCircuit/ApplicationContextProvider";

const useSoundHandlers = () => {
  const {
    startOscillator,
    startOscillatorSome,
    stopOscillator,
    stopOscillatorExcept,
    stopOscillatorExcepts,
    stopOscillatorAll,
  } = useApplicationContext();

  const handleStartSound: (tone: Tone) => void = (tone) => {
    startOscillator(tone);
  };

  const handleStartSomeSounds: (tones: Tone[]) => void = (tones) => {
    startOscillatorSome(tones);
  };

  const handleStopSound: (tone: Tone) => void = (tone) => {
    stopOscillator(tone);
  };

  const handleStartAndStopExceptSound: (tone: Tone | undefined) => void = (tone) => {
    if (tone) {
      startOscillator(tone);
      stopOscillatorExcept(tone);
    } else {
      stopOscillatorAll();
    }
  };

  const handleStopExcepts: (tones: Tone[]) => void = (tones) => {
    stopOscillatorExcepts(tones);
  };

  const handleStopAllSound: () => void = () => {
    stopOscillatorAll();
  };


  return {
    handleStartAndStopExceptSound,
    handleStartSomeSounds,
    handleStartSound,
    handleStopAllSound,
    handleStopExcepts,
    handleStopSound
  }

};

export default useSoundHandlers;