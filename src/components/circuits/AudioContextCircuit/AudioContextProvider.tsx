import { ReactNode, createContext, useContext, useState } from "react";
import { Tone, Waveform } from "@circuits/TypeCircuit";
import initTremoloEffect from "./TremoloEffectCircuit";
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
  depth: GainNode | null;
  lfo: OscillatorNode | null;
  analyser: AnalyserNode | null;
  waveform: Waveform | null;
  setWaveform: React.Dispatch<React.SetStateAction<Waveform | null>> | null;
};

type AudioContextState = SoundStateActionDispatchers & AudioContextProperties;

const AudioContextState = createContext<AudioContextState>({
  audioContext: null,
  masterVolume: null,
  amplitude: null,
  depth: null,
  lfo: null,
  analyser: null,
  waveform: null,
  setWaveform: null,
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
  const [depth, setDepth] = useState<GainNode | null>(null);
  const [lfo, setLfo] = useState<OscillatorNode | null>(null);
  const [analyser, setAnalyzer] = useState<AnalyserNode | null>(null);
  const [waveform, setWaveform] = useState<Waveform | null>(null);

  const createAudioContext = () => {
    const audioContext = new AudioContext();

    const masterVolume = audioContext.createGain();
    masterVolume.gain.setValueAtTime(0.5, audioContext.currentTime);
    masterVolume.connect(audioContext.destination);

    const analyserNode = audioContext.createAnalyser();
    analyserNode.connect(masterVolume);

    const amplitude = audioContext.createGain();
    amplitude.gain.setValueAtTime(0.5, audioContext.currentTime);
    amplitude.connect(analyserNode);

    const tremolo = initTremoloEffect(audioContext, amplitude);
    if (tremolo) {
      setDepth(tremolo.depth);
      setLfo(tremolo.lfo);
    }
    if (setWaveform) {
      setWaveform('sine');
    }

    setMasterVolume(masterVolume);
    setAmplitude(amplitude);
    setAudioContext(audioContext);
    setAnalyzer(analyserNode);

    return { audioContext, masterVolume, amplitude };
  };

  const closeAudioContext = () => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setMasterVolume(null);
      setAmplitude(null);
      setDepth(null);
      setLfo(null);
      setAnalyzer(null);
      setWaveform(null);
    }
  };

  useAudioContextInitEffect(createAudioContext, closeAudioContext);
  const dispatchers: SoundStateActionDispatchers = useSoundStatesReducer(audioContext, amplitude);

  return (
    <AudioContextState.Provider
      value={{
        audioContext,
        amplitude,
        masterVolume,
        depth,
        lfo,
        analyser,
        waveform,
        setWaveform,
        ...dispatchers,
      }}
    >
      {children}
    </AudioContextState.Provider>
  );
};

export const useAudioContextProvider = () => useContext(AudioContextState);
export default AudioContextProvider;
