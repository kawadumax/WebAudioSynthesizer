import React, {
  createContext,
  useContext,
  useState,
  useReducer,
  useEffect,
} from "react";

import { SoundState, Tone } from "./TypeCircuit";

type SoundStateAction =
  | { type: "START"; payload: Tone }
  | { type: "STOP"; payload: Tone }
  | { type: "STOP_EXCEPT"; payload: Tone }
  | { type: "STOP_EXCEPTS"; payload: Tone[] }
  | { type: "STOP_ALL" }
  | { type: "CLEAR"; payload: Tone };

const markAsEnded =
  (predicate: (s: SoundState) => boolean) => (s: SoundState) =>
    predicate(s) ? { ...s, isEnded: true } : s;

const soundStateReducer = (
  state: SoundState[],
  action: SoundStateAction
): SoundState[] => {
  switch (action.type) {
    case "START":
      if (state.some((s) => s.tone.name === action.payload.name)) {
        //すでにstart済みの音階がある場合は、追加せず状態をそのまま返す
        return state;
      } else {
        return [...state, { tone: action.payload, isStarted: true }];
      }
    case "STOP":
      return state.map(markAsEnded((s) => s.tone.name === action.payload.name));
    case "STOP_EXCEPT":
      // payloadに入っているtone以外全てのsoundStateにisEndedを付ける
      return state.map(markAsEnded((s) => s.tone.name !== action.payload.name));
    case "STOP_EXCEPTS":
      // payloadに入っている複数のtone以外全てのsoundStateにisEndedを付ける
      const toneNames = action.payload.map((tone) => tone.name);
      return state.map(markAsEnded((s) => !toneNames.includes(s.tone.name)));
    case "STOP_ALL":
      return state.map(markAsEnded(() => true));
    case "CLEAR":
      return state.filter((s) => s.tone.name !== action.payload.name);
    default:
      return state;
  }
};

interface Props {
  children: React.ReactNode;
}

interface AudioContextContainer {
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
  soundStates: SoundState[];
  createAudioContext: () => void;
  closeAudioContext: () => void;
  startOscillator: (tone: Tone) => void;
  stopOscillator: (tone: Tone) => void;
  stopOscillatorExcept: (tone: Tone) => void;
  stopOscillatorExcepts: (tones: Tone[]) => void;
  stopOscillatorAll: () => void;
}

const AudioContextContainer = createContext<AudioContextContainer>({
  audioContext: null,
  gainNode: null,
  soundStates: [],
  createAudioContext: () => {},
  closeAudioContext: () => {},
  startOscillator: () => {},
  stopOscillator: () => {},
  stopOscillatorAll: () => {},
  stopOscillatorExcept: () => {},
  stopOscillatorExcepts: () => {},
});

const AudioContextCircuit = ({ children }: Props) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [soundStates, dispatch] = useReducer(soundStateReducer, []);
  useEffect(() => {
    if (!audioContext || !gainNode) {
      return;
    }

    for (const state of soundStates) {
      if (state.isStarted && !state.isEnded && !state.oscillator) {
        // Sound started but not stopped yet and oscillator not created
        const osc = audioContext.createOscillator();
        osc.frequency.value = state.tone.freq;
        osc.connect(audioContext.destination);
        osc.start();
        state.oscillator = osc;
      } else if (state.isEnded && state.oscillator) {
        // Sound stopped and oscillator created
        state.oscillator.stop();
        state.oscillator.disconnect();
        state.oscillator = null;
        dispatch({ type: "CLEAR", payload: state.tone });
      }
    }
  }, [soundStates]);

  const createAudioContext = () => {
    const audioContext = new AudioContext();
    setAudioContext(audioContext);
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.connect(audioContext.destination);
    setGainNode(gainNode);
  };

  const closeAudioContext = () => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setGainNode(null);
    }
  };

  const startOscillator = (tone: Tone) => {
    if (!audioContext || !gainNode) return;
    if (findSoundSource(tone)) {
      return;
    }
    console.log("dispatch start: ", tone);
    dispatch({ type: "START", payload: tone });
  };

  const stopOscillator = (tone: Tone) => {
    console.log("dispatch stop: ", tone);
    dispatch({ type: "STOP", payload: tone });
  };

  const stopOscillatorExcept = (tone: Tone) => {
    console.log("dispatch stop except for: ", tone);
    dispatch({ type: "STOP_EXCEPT", payload: tone });
  };

  const stopOscillatorExcepts = (tones: Tone[]) => {
    console.log("dispatch stop except for: ", tones);
    dispatch({ type: "STOP_EXCEPTS", payload: tones });
  };

  const stopOscillatorAll = () => {
    console.log("dispatch stop all:");
    dispatch({ type: "STOP_ALL" });
  };

  const findSoundSource = (tone: Tone) => {
    return soundStates.find((ss) => ss.tone.name === tone.name);
  };

  return (
    <AudioContextContainer.Provider
      value={{
        audioContext,
        gainNode,
        soundStates,
        createAudioContext,
        closeAudioContext,
        startOscillator,
        stopOscillator,
        stopOscillatorExcept,
        stopOscillatorAll,
      }}
    >
      {children}
    </AudioContextContainer.Provider>
  );
};

export const useAudioContextCircuit = () => useContext(AudioContextContainer);

export default AudioContextCircuit;
