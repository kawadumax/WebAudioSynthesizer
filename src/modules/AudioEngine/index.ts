import type { Tone, Waveform } from "@/modules/AudioEngine/types";
import { VoiceManager } from "./VoiceManager";

export type SynthParams = {
  masterGain: number;
  tremoloDepth: number;
  tremoloFrequency: number;
  waveform: Waveform;
};

const DEFAULT_PARAMS: SynthParams = {
  masterGain: 0.5,
  tremoloDepth: 0.5,
  tremoloFrequency: 1,
  waveform: "sine",
};

const RAMP_SECONDS = 1;

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private amplitude: GainNode | null = null;
  private depth: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private params: SynthParams = { ...DEFAULT_PARAMS };
  private voiceManager: VoiceManager;

  constructor(voiceManager = new VoiceManager()) {
    this.voiceManager = voiceManager;
  }

  isInitialized() {
    return (
      !!this.audioContext &&
      !!this.masterVolume &&
      !!this.analyser &&
      !!this.amplitude &&
      !!this.depth &&
      !!this.lfo
    );
  }

  async init() {
    if (this.audioContext) return;
    const ac = new AudioContext();
    const masterVolume = ac.createGain();
    masterVolume.gain.setValueAtTime(this.params.masterGain, ac.currentTime);
    masterVolume.connect(ac.destination);

    const analyser = ac.createAnalyser();
    analyser.connect(masterVolume);

    const amplitude = ac.createGain();
    amplitude.gain.setValueAtTime(0.5, ac.currentTime);
    amplitude.connect(analyser);

    const depth = ac.createGain();
    depth.gain.setValueAtTime(this.params.tremoloDepth, ac.currentTime);

    const lfo = ac.createOscillator();
    lfo.frequency.value = this.params.tremoloFrequency;
    lfo.connect(depth);
    depth.connect(amplitude.gain);
    lfo.start();

    this.audioContext = ac;
    this.masterVolume = masterVolume;
    this.analyser = analyser;
    this.amplitude = amplitude;
    this.depth = depth;
    this.lfo = lfo;
  }

  async resume() {
    if (!this.audioContext) return;
    if (this.audioContext.state !== "running") {
      await this.audioContext.resume();
    }
  }

  async suspend() {
    if (!this.audioContext) return;
    if (this.audioContext.state === "running") {
      await this.audioContext.suspend();
    }
  }

  async dispose() {
    if (!this.audioContext) return;
    this.voiceManager.stopAll();
    if (this.lfo) {
      try {
        this.lfo.stop();
      } catch {
        // Ignore invalid state errors when stopping a finished LFO.
      } finally {
        this.lfo.disconnect();
      }
    }
    this.depth?.disconnect();
    this.amplitude?.disconnect();
    this.analyser?.disconnect();
    this.masterVolume?.disconnect();
    await this.audioContext.close();
    this.audioContext = null;
    this.masterVolume = null;
    this.analyser = null;
    this.amplitude = null;
    this.depth = null;
    this.lfo = null;
  }

  async loadWorklet(moduleUrl: string) {
    if (!this.audioContext) {
      throw new Error("AudioEngine is not initialized.");
    }
    await this.audioContext.audioWorklet.addModule(moduleUrl);
  }

  setMasterGain(value: number) {
    this.params.masterGain = value;
    if (!this.audioContext || !this.masterVolume) return;
    this.masterVolume.gain.setValueAtTime(value, this.audioContext.currentTime);
  }

  setTremoloDepth(value: number) {
    this.params.tremoloDepth = value;
    if (!this.audioContext || !this.depth) return;
    this.depth.gain.linearRampToValueAtTime(
      value,
      this.audioContext.currentTime + RAMP_SECONDS,
    );
  }

  setTremoloFrequency(value: number) {
    this.params.tremoloFrequency = value;
    if (!this.audioContext || !this.lfo) return;
    this.lfo.frequency.linearRampToValueAtTime(
      value,
      this.audioContext.currentTime + RAMP_SECONDS,
    );
  }

  setWaveform(value: Waveform) {
    this.params.waveform = value;
    this.voiceManager.setWaveformForAll(value);
  }

  startVoice(tone: Tone) {
    if (!this.audioContext || !this.amplitude) return;
    this.voiceManager.startVoice(tone, this.audioContext, this.amplitude, this.params.waveform);
  }

  startVoices(tones: Tone[]) {
    for (const tone of tones) {
      this.startVoice(tone);
    }
  }

  stopVoice(tone: Tone) {
    this.voiceManager.stopVoice(tone.name);
  }

  stopAll() {
    this.voiceManager.stopAll();
  }

  stopExcept(tone: Tone) {
    this.voiceManager.stopExcept(tone.name);
  }

  stopExcepts(tones: Tone[]) {
    this.voiceManager.stopExcepts(new Set(tones.map((tone) => tone.name)));
  }

  getAudioContext() {
    return this.audioContext;
  }

  getAnalyser() {
    return this.analyser;
  }
}

const audioEngineSingleton = new AudioEngine();
export default audioEngineSingleton;
