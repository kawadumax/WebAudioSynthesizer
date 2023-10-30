import { useReducer } from "react";
import { SoundState, SoundStateAction, Tone } from "@/modules/Type";
import { useSoundStatesEffect } from "./AudioBaseCircuit";

//stop時にはsoundStateを削除
//start時には追加。既にあればそのまま。

export const soundStateReducer = (
  state: SoundState[],
  action: SoundStateAction
): SoundState[] => {
  switch (action.type) {
    case "START":
      if (state.some((s) => s.tone.name === action.payload.name)) {
        return state;
      } else {
        return [...state, { tone: action.payload, isStarted: true }];
      }
    case "START_SOME":
      const newSounds = [];
      for (const newTone of action.payload) {
        if (state.some((s) => s.tone.name === newTone.name)) {
          continue;
        } else {
          newSounds.push({ tone: newTone, isStarted: true });
        }
      }
      return [...state, ...newSounds];
    case "STOP":
      return state.filter((s) => s.tone.name !== action.payload.name);
    case "STOP_EXCEPT":
      return state.filter((s) => s.tone.name === action.payload.name);
    case "STOP_EXCEPTS":
      const toneNames = action.payload.map((tone) => tone.name);
      return state.filter((s) => toneNames.includes(s.tone.name));
    case "STOP_ALL":
      return [];
    default:
      return state;
  }
};

export const useSoundStatesReducer = (
  audioContext: AudioContext | null,
  amplitude: GainNode | null
) => {
  const [soundStates, dispatch] = useReducer(soundStateReducer, []);
  useSoundStatesEffect(audioContext, amplitude, soundStates);

  const startOscillator = (tone: Tone) => {
    console.log("dispatch start: ", tone);
    dispatch({ type: "START", payload: tone });
  };

  const startOscillatorSome = (tones: Tone[]) => {
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

  return {
    startOscillator,
    startOscillatorSome,
    stopOscillator,
    stopOscillatorExcept,
    stopOscillatorExcepts,
    stopOscillatorAll,
  };
};
