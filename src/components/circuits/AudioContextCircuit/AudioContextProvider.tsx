import { ReactNode, createContext, useContext, useState } from "react";
import { Tone } from "@circuits/TypeCircuit";
import useFX from "./FXManagerCircuit";
import { useAudioContextInitEffect } from "./AudioEffect";
import { useSoundStatesReducer } from "./SoundStateReducer";

interface Props {
  children: ReactNode;
}

type SoundStateActionDispatchers = {
  startOscillator: (tone: Tone) => void;
  startOscillatorSome: (tones: Tone[]) => void;
  stopOscillator: (tone: Tone) => void;
  stopOscillatorExcept: (tone: Tone) => void;
  stopOscillatorExcepts: (tones: Tone[]) => void;
  stopOscillatorAll: () => void;
};

type AudioContextProperties = {
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
};

type AudioContextState = SoundStateActionDispatchers & AudioContextProperties;

const AudioContextState = createContext<AudioContextState>({
  audioContext: null,
  gainNode: null,
  startOscillator: () => { },
  startOscillatorSome: () => { },
  stopOscillator: () => { },
  stopOscillatorAll: () => { },
  stopOscillatorExcept: () => { },
  stopOscillatorExcepts: () => { },
});

const AudioContextProvider = ({ children }: Props) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const fxStates = useFX();

  const createAudioContext = () => {
    const audioContext = new AudioContext();
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.connect(audioContext.destination);
    setGainNode(gainNode);
    setAudioContext(audioContext);
    return { audioContext, gainNode };
  };

  const closeAudioContext = () => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setGainNode(null);
    }
  };

  useAudioContextInitEffect(createAudioContext, closeAudioContext);
  const dispatchers = useSoundStatesReducer(audioContext, gainNode);

  return (
    <AudioContextState.Provider
      value={{
        audioContext,
        gainNode,
        ...dispatchers,
      }}
    >
      {children}
    </AudioContextState.Provider>
  );
};

export const useAudioContextProvider = () => useContext(AudioContextState);
export default AudioContextProvider;
