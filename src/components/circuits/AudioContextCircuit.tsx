import React, {
  createContext,
  useContext,
  useState,
  useReducer,
  useEffect,
} from "react";

import { SoundState, Tone } from "./TypeCircuit";

type SoundStateAction =
  | { type: 'START'; payload: Tone; }
  | { type: 'STOP'; payload: Tone; }
  | { type: 'CLEAR'; payload: Tone; };

const soundStateReducer = (state: SoundState[], action: SoundStateAction): SoundState[] => {
  switch (action.type) {
    case 'START':
      return [...state, { tone: action.payload, isStarted: true }];
    case 'STOP':
      return state.map(s =>
        s.tone.name === action.payload.name ? { ...s, isEnded: true } : s
      );
    case 'CLEAR':
      return state.filter(s => s.tone.name !== action.payload.name);
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
  stopOscillatorAll: () => void;
}

const AudioContextContainer = createContext<AudioContextContainer>({
  audioContext: null,
  gainNode: null,
  soundStates: [],
  createAudioContext: () => { },
  closeAudioContext: () => { },
  startOscillator: () => { },
  stopOscillator: () => { },
  stopOscillatorAll: () => { },
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
        console.log("OSC START");
        // Sound started but not stopped yet and oscillator not created
        const osc = audioContext.createOscillator();
        osc.frequency.value = state.tone.freq;
        osc.connect(audioContext.destination);
        osc.start();
        state.oscillator = osc;
      } else if (state.isEnded && state.oscillator) {
        console.log("OSC STOP");
        // Sound stopped and oscillator created
        state.oscillator.stop();
        state.oscillator.disconnect();
        state.oscillator = null;
        dispatch({ type: 'CLEAR', payload: state.tone })
      }
    };
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

    console.log("will sound: ", tone);
    dispatch({
      type: "START",
      payload: tone,
    });
  };

  const stopOscillator = (tone: Tone) => {
    dispatch({ type: "STOP", payload: tone });
  };

  const stopOscillatorAll = () => {
    // dispatch({ type: "DROP" });
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
        stopOscillatorAll,
      }}
    >
      {children}
    </AudioContextContainer.Provider>
  );
};

export const useAudioContextCircuit = () => useContext(AudioContextContainer);

export default AudioContextCircuit;
