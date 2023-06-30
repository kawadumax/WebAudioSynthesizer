import React, { createContext, useContext, useState, useReducer } from "react";
import { SoundSource, Tone } from "./TypeCircuit";

// 現在再生中のオシレータを格納し管理する配列
type SoundSourceState = { previous: SoundSource[]; current: SoundSource[] };

type SoundSourceAction =
  | { type: "ADD"; payload: SoundSource }
  | { type: "REMOVE"; payload: Tone }
  | { type: "DROP" };

const soundSourceReducer = (
  state: SoundSourceState,
  action: SoundSourceAction
): SoundSourceState => {
  switch (action.type) {
    case "ADD":
      //payloadのtoneが既にstate.currentに存在していたら現在のstateをそのまま返す。
      if (state.current.includes(action.payload)) {
        return state;
      }
      return {
        previous: [...state.current],
        current: [...state.current, action.payload],
      };
    case "REMOVE":
      return {
        previous: [...state.current],
        current: state.current.filter(
          (ss) => ss.tone.name !== action.payload.name
        ),
      };
    case "DROP":
      return {
        previous: [...state.current],
        current: [],
      };
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
  soundSourceState: { previous: SoundSource[]; current: SoundSource[] };
  createAudioContext: () => void;
  closeAudioContext: () => void;
  startOscillator: (tone: Tone) => void;
  stopOscillator: (tone: Tone) => void;
  stopOscillatorAll: () => void;
}

const AudioContextContainer = createContext<AudioContextContainer>({
  audioContext: null,
  gainNode: null,
  soundSourceState: { previous: [], current: [] },
  createAudioContext: () => {},
  closeAudioContext: () => {},
  startOscillator: () => {},
  stopOscillator: () => {},
  stopOscillatorAll: () => {},
});

const AudioContextCircuit = ({ children }: Props) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [soundSourceState, dispatch] = useReducer(soundSourceReducer, {
    previous: [],
    current: [],
  });

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
      console.log("already sounded: ", findSoundSource(tone));
      return;
    } //既に音が鳴っている場合は早期リターン

    console.log("will sound: ", tone);
    const oscillatorNode = audioContext.createOscillator();
    oscillatorNode.connect(gainNode);
    oscillatorNode.frequency.setValueAtTime(
      tone.freq,
      audioContext.currentTime
    );
    oscillatorNode.type = "sine";
    oscillatorNode.start();
    oscillatorNode.onended = () => {
      oscillatorNode.disconnect(gainNode);
    };
    dispatch({
      type: "ADD",
      payload: { tone: tone, oscNode: oscillatorNode },
    });
  };

  const stopOscillator = (tone: Tone) => {
    const target = soundSourceState.current.find(
      (source) => source.tone.name === tone.name
    );
    if (target) {
      target.oscNode.stop();
      dispatch({ type: "REMOVE", payload: tone });
    } else {
      console.log("Don't match:", tone);
    }
  };

  const stopOscillatorAll = () => {
    for (const ss of soundSourceState.current) {
      ss.oscNode.stop();
      dispatch({ type: "REMOVE", payload: ss.tone });
    }
  };

  const findSoundSource = (tone: Tone) => {
    return soundSourceState.current.find((ss) => ss.tone.name === tone.name);
  };

  return (
    <AudioContextContainer.Provider
      value={{
        audioContext,
        gainNode,
        soundSourceState,
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
