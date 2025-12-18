import { createContext, type ReactNode, useContext, useEffect, useReducer, useState } from "react";
import type { ApplicationContextType, OscillatorStates, Tone, Waveform } from "@/modules/Type";
import { createOscillator, removeOscillator } from "@/modules/utils/WebAudioUtils";
import * as soundStateActions from "./SoundStateActions";
import SoundStateReducer from "./SoundStateReducer";

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

const ApplicationContextProvider = ({ children }: Props) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [masterVolume, setMasterVolume] = useState<GainNode | null>(null);
  const [analyser, setAnalyzer] = useState<AnalyserNode | null>(null);
  const [amplitude, setAmplitude] = useState<GainNode | null>(null);
  const [depth, setDepth] = useState<GainNode | null>(null);
  const [lfo, setLfo] = useState<OscillatorNode | null>(null);
  const [waveform, setWaveform] = useState<Waveform>("sine");

  const [soundStates, dispatch] = useReducer(SoundStateReducer, []);
  const [oscillatorStates] = useState<OscillatorStates>([]);

  useEffect(() => {
    const ac = new AudioContext();
    setAudioContext(ac);

    const mv = ac.createGain();
    mv.gain.setValueAtTime(0.5, ac.currentTime);
    mv.connect(ac.destination);
    setMasterVolume(mv);

    const an = ac.createAnalyser();
    an.connect(mv);
    setAnalyzer(an);

    const amp = ac.createGain();
    amp.gain.setValueAtTime(0.5, ac.currentTime);
    amp.connect(an);
    setAmplitude(amp);

    const depth = ac.createGain();
    setDepth(depth);

    const lfo = ac.createOscillator();
    lfo.frequency.value = 1;
    depth.gain.value = 0.5;
    lfo.connect(depth);
    depth.connect(amp.gain);
    lfo.start();
    setLfo(lfo);

    return () => {
      lfo.stop();
      ac.close();
    };
  }, []);

  useEffect(() => {
    //oscillatorStatesとsoundStatesの差集合を取る
    const ssToneMap = soundStates.map((s) => s.tone);
    const oscToneMap = oscillatorStates.map((s) => s.tone);

    const tonesToBeStop = oscToneMap.filter((s) => !ssToneMap.includes(s));
    const tonesToBeStart = ssToneMap.filter((s) => !oscToneMap.includes(s));

    for (const tone of tonesToBeStop) {
      removeOscillator(tone, oscillatorStates);
    }
    for (const tone of tonesToBeStart) {
      createOscillator(tone, oscillatorStates, audioContext, amplitude, waveform);
    }
  }, [soundStates, amplitude, audioContext, oscillatorStates, waveform]);

  const boundActions = {
    startOscillator: (tone: Tone) => soundStateActions.startOscillator(dispatch, tone),
    startOscillatorSome: (tones: Tone[]) => soundStateActions.startOscillatorSome(dispatch, tones),
    stopOscillator: (tone: Tone) => soundStateActions.stopOscillator(dispatch, tone),
    stopOscillatorAll: () => soundStateActions.stopOscillatorAll(dispatch),
    stopOscillatorExcept: (tone: Tone) => soundStateActions.stopOscillatorExcept(dispatch, tone),
    stopOscillatorExcepts: (tones: Tone[]) =>
      soundStateActions.stopOscillatorExcepts(dispatch, tones),
  };

  return (
    <ApplicationContext.Provider
      value={{
        audioContext: audioContext!,
        masterVolume: masterVolume!,
        analyser: analyser!,
        amplitude: amplitude!,
        depth: depth!,
        lfo: lfo!,
        waveform,
        setWaveform,
        ...boundActions,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error("ApplicationContext Error.");
  }
  return context;
};

export default ApplicationContextProvider;
