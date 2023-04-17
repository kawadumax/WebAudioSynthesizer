import React, { createContext, useContext, useState } from "react";

interface AudioContextCircuitProps {
  children: React.ReactNode;
}

interface AudioContextStore {
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
  oscillatorNode: OscillatorNode | null;
  createAudioContext: () => void;
  closeAudioContext: () => void;
  // createOscillator: () => void;
  startOscillator: () => void;
  stopOscillator: () => void;
}

const AudioContextContainer = createContext<AudioContextStore>({
  audioContext: null,
  gainNode: null,
  oscillatorNode: null,
  createAudioContext: () => {},
  closeAudioContext: () => {},
  // createOscillator: () => {},
  startOscillator: () => {},
  stopOscillator: () => {},
});

const AudioContextCircuit = ({ children }: AudioContextCircuitProps) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [oscillatorNode, setOscillatorNode] = useState<OscillatorNode | null>(
    null
  );

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

  const startOscillator = () => {
    if (audioContext && gainNode) {
      const oscillatorNode = audioContext.createOscillator();
      oscillatorNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillatorNode.frequency.setValueAtTime(440, audioContext.currentTime); // A4
      oscillatorNode.type = "sine";
      setOscillatorNode(oscillatorNode);
      oscillatorNode.start();
      oscillatorNode.onended = () => {
        oscillatorNode.disconnect(gainNode);
        gainNode.disconnect(audioContext.destination);
      };
    }
  };

  const stopOscillator = () => {
    if (oscillatorNode) oscillatorNode.stop();
  };

  return (
    <AudioContextContainer.Provider
      value={{
        audioContext,
        gainNode,
        oscillatorNode,
        createAudioContext,
        closeAudioContext,
        // createOscillator,
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
