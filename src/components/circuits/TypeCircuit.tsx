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
 * SoundSource オブジェクトは、音源である OscillatorNode とそれに関連する Tone の情報を
 * 一緒に格納するために使用されます。具体的には、以下のプロパティを持っています:
 *
 * - `tone`: {@link Tone} この音源の Tone
 * - `oscNode`: {@link OscillatorNode} 発音中の OscillatorNode
 *
 * @property tone この音源の Tone
 * @property oscNode 発音中の OscillatorNode
 */
export interface SoundSource {
  tone: Tone;
  oscNode?: OscillatorNode;
}
