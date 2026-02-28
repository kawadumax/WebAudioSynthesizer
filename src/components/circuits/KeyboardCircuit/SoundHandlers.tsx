import type { Tone } from "@/modules/AudioEngine/types";
import { useAudioEngine } from "../AudioCircuit/AudioEngineProvider";

const useSoundHandlers = () => {
  const { engine } = useAudioEngine();

  const handleStartSound: (tone: Tone) => void = (tone) => {
    engine.startVoice(tone);
  };

  const handleStartSomeSounds: (tones: Tone[]) => void = (tones) => {
    engine.startVoices(tones);
  };

  const handleStopSound: (tone: Tone) => void = (tone) => {
    engine.stopVoice(tone);
  };

  const handleStartAndStopExceptSound: (tone: Tone | undefined) => void = (tone) => {
    if (tone) {
      engine.startVoice(tone);
      engine.stopExcept(tone);
    } else {
      engine.stopAll();
    }
  };

  const handleStopExcepts: (tones: Tone[]) => void = (tones) => {
    engine.stopExcepts(tones);
  };

  const handleStopAllSound: () => void = () => {
    engine.stopAll();
  };

  return {
    handleStartAndStopExceptSound,
    handleStartSomeSounds,
    handleStartSound,
    handleStopAllSound,
    handleStopExcepts,
    handleStopSound,
  };
};

export default useSoundHandlers;
