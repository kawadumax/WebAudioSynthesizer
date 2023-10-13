import { ReactNode, createContext, useContext, useState } from "react";
import { Tone } from "@circuits/TypeCircuit";
import useTremoloEffect from "./TremoloEffectCircuit";
import { useAudioContextInitEffect } from "./AudioBaseCircuit";
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
  amplitude: GainNode | null;
  masterVolume: GainNode | null;
  tremolo: { depth: GainNode, lfo: OscillatorNode } | null;
};

type AudioContextState = SoundStateActionDispatchers & AudioContextProperties;

const AudioContextState = createContext<AudioContextState>({
  audioContext: null,
  masterVolume: null,
  amplitude: null,
  tremolo: null,
  startOscillator: () => { },
  startOscillatorSome: () => { },
  stopOscillator: () => { },
  stopOscillatorAll: () => { },
  stopOscillatorExcept: () => { },
  stopOscillatorExcepts: () => { },
});

const AudioContextProvider = ({ children }: Props) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [masterVolume, setMasterVolume] = useState<GainNode | null>(null);
  const [amplitude, setAmplitude] = useState<GainNode | null>(null);

  const createAudioContext = () => {
    const audioContext = new AudioContext();

    const masterVolume = audioContext.createGain();
    masterVolume.gain.setValueAtTime(0.5, audioContext.currentTime);
    masterVolume.connect(audioContext.destination);

    const amplitude = audioContext.createGain();
    amplitude.gain.setValueAtTime(0.5, audioContext.currentTime);
    amplitude.connect(masterVolume);

    setMasterVolume(masterVolume);
    setAmplitude(amplitude);
    setAudioContext(audioContext);

    return { audioContext, masterVolume, amplitude };
  };

  const closeAudioContext = () => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setMasterVolume(null);
      setAmplitude(null);
    }
  };

  useAudioContextInitEffect(createAudioContext, closeAudioContext);
  const tremolo = useTremoloEffect(audioContext, amplitude);
  const dispatchers: SoundStateActionDispatchers = useSoundStatesReducer(audioContext, amplitude);

  return (
    <AudioContextState.Provider
      value={{
        audioContext,
        amplitude,
        masterVolume,
        tremolo,
        ...dispatchers,
      }}
    >
      {children}
    </AudioContextState.Provider>
  );
};

export const useAudioContextProvider = () => useContext(AudioContextState);
export default AudioContextProvider;
