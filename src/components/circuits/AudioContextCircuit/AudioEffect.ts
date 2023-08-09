import { useEffect, Dispatch } from "react";
import { SoundState, SoundStateAction } from "../TypeCircuit";

export const useInitAudioContext = (
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

    let animationFrameId: number;
    const loop = () => {
      // gainNode の value を時間によって変化させる関数を記述
      gainNode.gain.value = updateGainNode(audioContext.currentTime);
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      closeAudioContext();
    };
  }, []);
};

export const useSoundStatesEffect = (
  audioContext: AudioContext | null,
  gainNode: GainNode | null,
  soundStates: SoundState[],
  dispatch: Dispatch<SoundStateAction>
) => {
  useEffect(() => {
    if (!audioContext || !gainNode) {
      return;
    }
    console.log("onEffect: ", soundStates);
    for (const state of soundStates) {
      if (state.isStarted && !state.isEnded && !state.oscillator) {
        // Sound started but not stopped yet and oscillator not created
        const osc = audioContext.createOscillator();
        osc.frequency.value = state.tone.freq;
        osc.connect(gainNode);
        osc.start();
        state.oscillator = osc;
      } else if (state.isEnded && state.oscillator) {
        // Sound stopped and oscillator created
        state.oscillator.stop();
        state.oscillator.disconnect();
        state.oscillator = null;
        console.log("dispatch CLEAR", state.tone);
        dispatch({ type: "CLEAR", payload: state.tone });
      }
    }
  }, [soundStates]);
};
