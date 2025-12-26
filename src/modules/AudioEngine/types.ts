export interface Tone {
  name: string;
  freq: number;
}

export type SoundState = {
  tone: Tone;
  isStarted: boolean;
  isEnded?: boolean;
};

export type OscillatorState = {
  tone: Tone;
  oscillator: OscillatorNode;
};

export type OscillatorStates = OscillatorState[];

export type SoundStateAction =
  | { type: "START"; payload: Tone }
  | { type: "START_SOME"; payload: Tone[] }
  | { type: "STOP"; payload: Tone }
  | { type: "STOP_EXCEPT"; payload: Tone }
  | { type: "STOP_EXCEPTS"; payload: Tone[] }
  | { type: "STOP_ALL" };

export type Waveform = "sine" | "square" | "sawtooth" | "triangle";

export type SoundStateActionDispatchers = {
  startOscillator: (tone: Tone) => void;
  startOscillatorSome: (tones: Tone[]) => void;
  stopOscillator: (tone: Tone) => void;
  stopOscillatorExcept: (tone: Tone) => void;
  stopOscillatorExcepts: (tones: Tone[]) => void;
  stopOscillatorAll: () => void;
};

export type ApplicationContextProperties = {
  audioContext: AudioContext;
  amplitude: GainNode;
  masterVolume: GainNode;
  depth: GainNode;
  lfo: OscillatorNode;
  analyser: AnalyserNode;
  waveform: Waveform;
  setWaveform: React.Dispatch<React.SetStateAction<Waveform>>;
};

export type ApplicationContextType = SoundStateActionDispatchers & ApplicationContextProperties;
