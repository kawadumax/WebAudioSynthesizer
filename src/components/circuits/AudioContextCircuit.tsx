import React, {
  createContext,
  useContext,
  useState,
  useReducer,
  useEffect,
} from "react";

import { SoundState, Tone } from "./TypeCircuit";
import useFX from "./FXManagerCircuit";
type SoundStateAction =
  | { type: "START"; payload: Tone }
  | { type: "START_SOME"; payload: Tone[] }
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
    case "START_SOME":
      //action.payloadの配列全てを追加するが、ただし既にstartedがtrueであればそのままにする。
      const newSounds = [];
      for (const newTone of action.payload) {
        if (state.some((s) => s.tone.name === newTone.name && s.isStarted && s.oscillator)) {
          continue;
        } else {
          newSounds.push({ tone: newTone, isStarted: true });
        }
      }
      return [...state, ...newSounds];
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
  startOscillatorSome: (tones: Tone[]) => void;
  stopOscillator: (tone: Tone) => void;
  stopOscillatorExcept: (tone: Tone) => void;
  stopOscillatorExcepts: (tones: Tone[]) => void;
  stopOscillatorAll: () => void;
}

const AudioContextContainer = createContext<AudioContextContainer>({
  audioContext: null,
  gainNode: null,
  soundStates: [],
  createAudioContext: () => { },
  closeAudioContext: () => { },
  startOscillator: () => { },
  startOscillatorSome: () => { },
  stopOscillator: () => { },
  stopOscillatorAll: () => { },
  stopOscillatorExcept: () => { },
  stopOscillatorExcepts: () => { },
});

const AudioContextCircuit = ({ children }: Props) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [soundStates, dispatch] = useReducer(soundStateReducer, []);
  const fxStates = useFX();
  useEffect(() => {
    const { audioContext, gainNode } = createAudioContext();

    let animationFrameId: number;
    const loop = () => {
      // gainNode の value を時間によって変化させる関数を記述
      gainNode.gain.value = updateGainNode(audioContext.currentTime);
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      closeAudioContext();
    }
  }, []);

  useEffect(() => {
    if (!audioContext || !gainNode) {
      return;
    }
    console.log("onEffect: ", soundStates);
    for (const state of soundStates) {
      if (state.isStarted && !state.isEnded && !state.oscillator) {
        // Sound started but not stopped yet and oscillator not created
        const osc = audioContext.createOscillator();
        osc.frequency.value = state.tone.freq;
        osc.connect(gainNode);
        osc.start();
        state.oscillator = osc;
      } else if (state.isEnded && state.oscillator) {
        // Sound stopped and oscillator created
        state.oscillator.stop();
        state.oscillator.disconnect();
        state.oscillator = null;
        console.log("dispatch CLEAR", state.tone);
        dispatch({ type: "CLEAR", payload: state.tone });
      }
    }

  }, [soundStates]);

  const updateGainNode = (currentTime: number) => {
    const baseGain = 0.5;
    const depth = 0.5;
    const frequency = 0.5;
    return baseGain * depth * Math.sin(2 * Math.PI * frequency * currentTime);
  }

  const createAudioContext = () => {
    const audioContext = new AudioContext();
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.connect(audioContext.destination);
    setGainNode(gainNode);
    setAudioContext(audioContext);
    return { audioContext, gainNode }
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

  const startOscillatorSome = (tones: Tone[]) => {
    if (!audioContext || !gainNode) return;
    console.log("dispatch start some: ", tones);
    dispatch({ type: "START_SOME", payload: tones });
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
        startOscillatorSome,
        stopOscillator,
        stopOscillatorExcept,
        stopOscillatorExcepts,
        stopOscillatorAll,
      }}
    >
      {children}
    </AudioContextContainer.Provider>
  );
};

export const useAudioContextCircuit = () => useContext(AudioContextContainer);

export default AudioContextCircuit;
