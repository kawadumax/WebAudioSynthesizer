export interface Tone {
  name: string;
  freq: number;
}

export interface SoundSource {
  // 発音中のOscilatorNodeの情報を纏めたオブジェクト
  tone: Tone;
  oscNode: OscillatorNode;
}
