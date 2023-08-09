import { useReducer } from "react";
import { SoundState, SoundStateAction, Tone } from "../TypeCircuit";

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
        if (
          state.some(
            (s) => s.tone.name === newTone.name && s.isStarted && s.oscillator
          )
        ) {
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

export const useSoundStatesReducer = () => {
  const [soundStates, dispatch] = useReducer(soundStateReducer, []);

  const findSoundSource = (tone: Tone) => {
    return soundStates.find((ss) => ss.tone.name === tone.name);
  };

  const startOscillator = (tone: Tone) => {
    // if (!audioContext || !gainNode) return;
    if (findSoundSource(tone)) {
      return;
    }
    console.log("dispatch start: ", tone);
    dispatch({ type: "START", payload: tone });
  };

  const startOscillatorSome = (tones: Tone[]) => {
    // if (!audioContext || !gainNode) return;
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
    soundStates,
    dispatch,
    startOscillator,
    startOscillatorSome,
    stopOscillator,
    stopOscillatorExcept,
    stopOscillatorExcepts,
    stopOscillatorAll,
  };
};
