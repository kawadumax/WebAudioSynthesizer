import { useEffect, Dispatch, useState } from "react";
import {
  OscillatorStates,
  SoundState,
  SoundStateAction,
  Tone,
} from "../TypeCircuit";

export const useAudioContextInitEffect = (
  createAudioContext: () => {
    audioContext: AudioContext;
    gainNode: GainNode;
  },
  closeAudioContext: () => void
) => {
  const updateGainNode = (currentTime: number) => {
    const baseGain = 0.5;
    const depth = 0.5;
    const frequency = 0.5;
    return baseGain * depth * Math.sin(2 * Math.PI * frequency * currentTime);
  };
  useEffect(() => {
    const { audioContext, gainNode } = createAudioContext();

    // let animationFrameId: number;
    // const loop = () => {
    //   // gainNode の value を時間によって変化させる関数を記述
    //   gainNode.gain.value = updateGainNode(audioContext.currentTime);
    //   animationFrameId = requestAnimationFrame(loop);
    // };
    // loop();

    return () => {
      // cancelAnimationFrame(animationFrameId);
      closeAudioContext();
    };
  }, []);
};

export const useSoundStatesEffect = (
  audioContext: AudioContext | null,
  gainNode: GainNode | null,
  soundStates: SoundState[]
) => {
  const [oscillatorStates] = useState<OscillatorStates>([]);
  const createOscillator = (tone: Tone) => {
    if (!audioContext || !gainNode) {
      return;
    }
    const osc = audioContext.createOscillator();
    osc.frequency.value = tone.freq;
    osc.connect(gainNode);
    osc.start();
    oscillatorStates.push({ tone: tone, oscillator: osc });
  };
  const removeOscillator = (tone: Tone) => {
    let index = oscillatorStates.findIndex((s) => tone.name === s.tone.name);
    oscillatorStates[index].oscillator.stop();
    oscillatorStates[index].oscillator.disconnect();
    oscillatorStates.splice(index, 1);
  };

  useEffect(() => {
    if (!audioContext || !gainNode) {
      return;
    }

    //oscillatorStatesとsoundStatesの差集合を取る
    const ssToneMap = soundStates.map((s) => s.tone);
    const oscToneMap = oscillatorStates.map((s) => s.tone);

    const tonesToBeStop = oscToneMap.filter((s) => !ssToneMap.includes(s));
    const tonesToBeStart = ssToneMap.filter((s) => !oscToneMap.includes(s));

    for (const tone of tonesToBeStop) {
      removeOscillator(tone);
    }
    for (const tone of tonesToBeStart) {
      createOscillator(tone);
    }
  }, [soundStates]);
};
