import type { Tone, Waveform } from "@/modules/AudioEngine/types";

export type Voice = {
  tone: Tone;
  oscillator: OscillatorNode;
  gain: GainNode;
};

export class VoiceManager {
  private voices = new Map<string, Voice>();

  startVoice(
    tone: Tone,
    audioContext: AudioContext,
    output: AudioNode,
    waveform: Waveform,
  ) {
    if (this.voices.has(tone.name)) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.frequency.value = tone.freq;
    osc.type = waveform;
    gain.gain.value = 1;
    osc.connect(gain);
    gain.connect(output);
    osc.start();
    this.voices.set(tone.name, { tone, oscillator: osc, gain });
  }

  stopVoice(toneName: string) {
    const voice = this.voices.get(toneName);
    if (!voice) return;
    this.stopAndRemove(voice);
  }

  stopAll() {
    for (const voice of Array.from(this.voices.values())) {
      this.stopAndRemove(voice);
    }
  }

  stopExcept(toneName: string) {
    for (const [name, voice] of Array.from(this.voices.entries())) {
      if (name !== toneName) {
        this.stopAndRemove(voice);
      }
    }
  }

  stopExcepts(toneNames: Set<string>) {
    for (const [name, voice] of Array.from(this.voices.entries())) {
      if (!toneNames.has(name)) {
        this.stopAndRemove(voice);
      }
    }
  }

  setWaveformForAll(waveform: Waveform) {
    for (const voice of this.voices.values()) {
      voice.oscillator.type = waveform;
    }
  }

  getActiveTones(): Tone[] {
    return Array.from(this.voices.values()).map((voice) => voice.tone);
  }

  private stopAndRemove(voice: Voice) {
    try {
      voice.oscillator.stop();
    } catch {
      // Ignore invalid state errors when stopping a finished voice.
    } finally {
      voice.oscillator.disconnect();
      voice.gain.disconnect();
      this.voices.delete(voice.tone.name);
    }
  }
}

const voiceManagerSingleton = new VoiceManager();
export default voiceManagerSingleton;
