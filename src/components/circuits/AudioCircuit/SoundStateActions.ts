import type { Dispatch } from "react";
import type { SoundStateAction, Tone } from "@/modules/Type";

export const startOscillator = (dispatch: Dispatch<SoundStateAction>, tone: Tone) => {
  console.log("dispatch start: ", tone);
  dispatch({ type: "START", payload: tone });
};

export const startOscillatorSome = (dispatch: Dispatch<SoundStateAction>, tones: Tone[]) => {
  console.log("dispatch start some: ", tones);
  dispatch({ type: "START_SOME", payload: tones });
};

export const stopOscillator = (dispatch: Dispatch<SoundStateAction>, tone: Tone) => {
  console.log("dispatch stop: ", tone);
  dispatch({ type: "STOP", payload: tone });
};

export const stopOscillatorExcept = (dispatch: Dispatch<SoundStateAction>, tone: Tone) => {
  console.log("dispatch stop except for: ", tone);
  dispatch({ type: "STOP_EXCEPT", payload: tone });
};

export const stopOscillatorExcepts = (dispatch: Dispatch<SoundStateAction>, tones: Tone[]) => {
  console.log("dispatch stop except for: ", tones);
  dispatch({ type: "STOP_EXCEPTS", payload: tones });
};

export const stopOscillatorAll = (dispatch: Dispatch<SoundStateAction>) => {
  console.log("dispatch stop all:");
  dispatch({ type: "STOP_ALL" });
};
