import React, { createContext, useContext, useState } from "react";

interface AudioContextCircuitProps {
  children: React.ReactNode;
}

interface AudioContextStore {
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
  createAudioContext: () => void;
  closeAudioContext: () => void;
}

const AudioContextContainer = createContext<AudioContextStore>({
  audioContext: null,
  gainNode: null,
  createAudioContext: () => {},
  closeAudioContext: () => {},
});

const AudioContextCircuit = ({ children }: AudioContextCircuitProps) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  const createAudioContext = () => {
    console.log("create audio context");
    const audioContext = new AudioContext();
    setAudioContext(audioContext);

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
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

  return (
    <AudioContextContainer.Provider
      value={{ audioContext, gainNode, createAudioContext, closeAudioContext }}
    >
      {children}
    </AudioContextContainer.Provider>
  );
};

export const useAudioContext = () => useContext(AudioContextContainer);

export default AudioContextCircuit;
