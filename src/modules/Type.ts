/**
 * トーンを表すインターフェース
 */
export interface Tone {
  /**
   * トーンの名前
   */
  name: string;

  /**
   * トーンの周波数
   */
  freq: number;

  // type: Waveform;
}

/**
 * 発音中の OscillatorNode の情報を纏めたオブジェクト
 *
 * @remarks
 * SoundState オブジェクトは、音源である OscillatorNode とそれに関連する Tone の情報を
 * 一緒に格納するために使用されます。具体的には、以下のプロパティを持っています:
 *
 * - `tone`: {@link Tone} この音源の Tone
 *
 * @property tone この音源の Tone
 */
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
// | { type: "CLEAR"; payload: Tone };

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

export type ApplicationContextType = SoundStateActionDispatchers &
  ApplicationContextProperties;
