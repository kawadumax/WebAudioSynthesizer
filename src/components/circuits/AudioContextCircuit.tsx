import React, { createContext, useContext, useState } from "react";
import { SoundSource, Tone } from "./TypeCircuit";

interface AudioContextCircuitProps {
  children: React.ReactNode;
}

interface AudioContextStore {
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
  soundSources: SoundSource[];
  createAudioContext: () => void;
  closeAudioContext: () => void;
  startOscillator: (tone: Tone) => void;
  stopOscillator: (tone: Tone) => void;
}

const AudioContextContainer = createContext<AudioContextStore>({
  audioContext: null,
  gainNode: null,
  soundSources: [],
  createAudioContext: () => {},
  closeAudioContext: () => {},
  startOscillator: () => {},
  stopOscillator: () => {},
});

const AudioContextCircuit = ({ children }: AudioContextCircuitProps) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [soundSources, setSoundSouces] = useState<SoundSource[]>([]);

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
      setSoundSouces([
        ...soundSources,
        {
          tone: tone,
          oscNode: oscillatorNode,
        },
      ]);
    }
  };

  const stopOscillator = (tone: Tone) => {
    const index = soundSources.findIndex((ss) => {
      return ss.tone.name === tone.name;
    });
    const source = soundSources.splice(index)[0];
    source.oscNode.stop();
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
