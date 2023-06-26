

import React, { createContext, useContext, useState, useReducer } from "react";
import { SoundSource, Tone } from "./TypeCircuit";

// 現在再生中のオシレータを格納し管理する配列
type SoundSourceState = SoundSource[];

type SoundSourceAction =
  | { type: 'ADD'; payload: SoundSource }
  | { type: 'REMOVE'; payload: Tone }
  | { type: 'FIND'; payload: Tone }

const soundSourceReducer = (state: SoundSourceState, action: SoundSourceAction): SoundSourceState | boolean => {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];
    case 'REMOVE':
      return state.filter((ss) => ss.tone.name !== action.payload.name);
    case 'FIND':
      return state.includes(action.payload);
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
  soundSources: SoundSource[];
  createAudioContext: () => void;
  closeAudioContext: () => void;
  startOscillator: (tone: Tone) => void;
  stopOscillator: (tone: Tone) => void;
}

const AudioContextContainer = createContext<AudioContextContainer>({
  audioContext: null,
  gainNode: null,
  soundSources: [],
  createAudioContext: () => { },
  closeAudioContext: () => { },
  startOscillator: () => { },
  stopOscillator: () => { },
});

const AudioContextCircuit = ({ children }: Props) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [soundSources, dispatch] = useReducer(soundSourceReducer, []);

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
    if (audioContext && gainNode) {
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
      dispatch({ type: "ADD", payload: { tone: tone, oscNode: oscillatorNode } });
    }
  };

  const stopOscillator = (tone: Tone) => {
    const target = soundSources.find((source) => source.tone.name === tone.name);
    if (target) {
      target.oscNode.stop();
      dispatch({ type: "REMOVE", payload: tone });
    } else {
      console.log("Don't match:", tone)
    }
  };

  return (
    <AudioContextContainer.Provider
      value={{
        audioContext,
        gainNode,
        soundSources,
        createAudioContext,
        closeAudioContext,
        startOscillator,
        stopOscillator,
      }}
    >
      {children}
    </AudioContextContainer.Provider>
  );
};

export const useAudioContextCircuit = () => useContext(AudioContextContainer);

export default AudioContextCircuit;
