import { useEffect, useState } from "react";
import { OscillatorStates, SoundState, Tone } from "@/modules/Type";
import { useApplicationContext } from "./ApplicationContextProvider";

// export const useAudioContextEffect = (
//   // createAudioContext: () => {
//   //   audioContext: AudioContext;
//   //   masterVolume: GainNode;
//   // },
//   closeAudioContext: () => void
// ) => {
//   useEffect(() => {
//     // createAudioContext();
//     return () => {
//       closeAudioContext();
//     };
//   }, []);
// };

export const useSoundStatesEffect = (
  audioContext: AudioContext | null,
  amplitude: GainNode | null,
  soundStates: SoundState[]
) => {
  const [oscillatorStates] = useState<OscillatorStates>([]);
  const createOscillator = (tone: Tone) => {
    const { waveform } = useApplicationContext();
    if (!audioContext || !amplitude) {
      return;
    }
    const osc = audioContext.createOscillator();
    osc.frequency.value = tone.freq;
    osc.type = waveform;
    osc.connect(amplitude);
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
    if (!audioContext || !amplitude) {
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
