import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Tone, Waveform } from "@/modules/Type";
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
  audioContext: AudioContext;
  amplitude: GainNode;
  masterVolume: GainNode;
  depth: GainNode;
  lfo: OscillatorNode;
  analyser: AnalyserNode;
  waveform: Waveform;
  setWaveform: React.Dispatch<React.SetStateAction<Waveform>>;
};

type ApplicationContextType = SoundStateActionDispatchers &
  AudioContextProperties;

const initializeApplicationContext = (): ApplicationContextType => {
  const [audioContext, setAudioContext] = useState(new AudioContext());
  const [masterVolume, setMasterVolume] = useState(audioContext.createGain());
  masterVolume.gain.setValueAtTime(0.5, audioContext.currentTime);
  masterVolume.connect(audioContext.destination);

  const [analyser, setAnalyzer] = useState(audioContext.createAnalyser());
  analyser.connect(masterVolume);

  const [amplitude, setAmplitude] = useState(audioContext.createGain());
  amplitude.gain.setValueAtTime(0.5, audioContext.currentTime);
  amplitude.connect(analyser);

  const [depth, setDepth] = useState(audioContext.createGain());
  const [lfo, setLfo] = useState(audioContext.createOscillator());

  lfo.frequency.value = 1;
  depth.gain.value = 0.5;
  lfo.connect(depth);
  depth.connect(amplitude.gain);
  lfo.start();

  const [waveform, setWaveform] = useState<Waveform>("sine");

  return {
    audioContext,
    masterVolume,
    amplitude,
    depth,
    lfo,
    analyser,
    waveform,
    setWaveform,
  };
};

const initialValues = useInitializeApplicationContext();
const ApplicationContext = createContext<ApplicationContextType>(initialValues);

const ApplicationContextProvider = ({ children }: Props) => {
  // const closeAudioContext = () => {
  //   audioContext.close();
  //   setAudioContext(null);
  //   setMasterVolume(null);
  //   setAmplitude(null);
  //   setDepth(null);
  //   setLfo(null);
  //   setAnalyzer(null);
  //   setWaveform(null);
  // };

  // useAudioContextInitEffect(createAudioContext, closeAudioContext);
  const dispatchers: SoundStateActionDispatchers = useSoundStatesReducer(
    initialValues.audioContext,
    initialValues.amplitude
  );

  return (
    <ApplicationContext.Provider
      value={{
        ...initialValues,
        ...dispatchers,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => useContext(ApplicationContext);
export default ApplicationContextProvider;
