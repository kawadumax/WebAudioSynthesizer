import type { OscillatorStates, Tone, Waveform } from "../AudioEngine/types";

export const createOscillator = (
  tone: Tone,
  oscillatorStates: OscillatorStates,
  audioContext: AudioContext | null,
  amplitude: GainNode | null,
  waveform: Waveform,
) => {
  if (!audioContext || !amplitude) return;
  const osc = audioContext.createOscillator();
  osc.frequency.value = tone.freq;
  osc.type = waveform;
  osc.connect(amplitude);
  osc.start();
  oscillatorStates.push({ tone: tone, oscillator: osc });
};

export const removeOscillator = (tone: Tone, oscillatorStates: OscillatorStates) => {
  const index = oscillatorStates.findIndex((s) => tone.name === s.tone.name);
  oscillatorStates[index].oscillator.stop();
  oscillatorStates[index].oscillator.disconnect();
  oscillatorStates.splice(index, 1);
};
