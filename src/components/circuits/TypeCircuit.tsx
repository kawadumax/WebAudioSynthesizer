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
}

/**
 * 発音中の OscillatorNode の情報を纏めたオブジェクト
 *
 * @remarks
 * SoundState オブジェクトは、音源である OscillatorNode とそれに関連する Tone の情報を
 * 一緒に格納するために使用されます。具体的には、以下のプロパティを持っています:
 *
 * - `tone`: {@link Tone} この音源の Tone
 * - `oscNode`: {@link OscillatorNode} 発音中の OscillatorNode
 *
 * @property tone この音源の Tone
 * @property oscillator 発音中の OscillatorNode
 */
export type SoundState = {
  tone: Tone;
  // oscillator?: OscillatorNode | null;
  isStarted: boolean;
  isEnded?: boolean;
};

export type OscillatorState = {
  tone: Tone;
  oscillator: OscillatorNode;
}

export type OscillatorStates = OscillatorState[];

export type SoundStateAction =
  | { type: "START"; payload: Tone }
  | { type: "START_SOME"; payload: Tone[] }
  | { type: "STOP"; payload: Tone }
  | { type: "STOP_EXCEPT"; payload: Tone }
  | { type: "STOP_EXCEPTS"; payload: Tone[] }
  | { type: "STOP_ALL" }
  // | { type: "CLEAR"; payload: Tone };
