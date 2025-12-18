import type { SoundState, SoundStateAction } from "@/modules/Type";

const SoundStateReducer = (state: SoundState[], action: SoundStateAction): SoundState[] => {
  switch (action.type) {
    case "START":
      if (state.some((s) => s.tone.name === action.payload.name)) {
        return state;
      } else {
        return [...state, { tone: action.payload, isStarted: true }];
      }
    case "START_SOME": {
      const newSounds = [];
      for (const newTone of action.payload) {
        if (state.some((s) => s.tone.name === newTone.name)) {
        } else {
          newSounds.push({ tone: newTone, isStarted: true });
        }
      }
      console.log("soundstate", state, newSounds);
      return [...state, ...newSounds];
    }
    case "STOP":
      return state.filter((s) => s.tone.name !== action.payload.name);
    case "STOP_EXCEPT":
      return state.filter((s) => s.tone.name === action.payload.name);
    case "STOP_EXCEPTS": {
      const toneNames = action.payload.map((tone) => tone.name);
      return state.filter((s) => toneNames.includes(s.tone.name));
    }
    case "STOP_ALL":
      return [];
    default:
      return state;
  }
};

export default SoundStateReducer;
