import type { Tone, Waveform } from "@/modules/AudioEngine/types";
import type { InsertFxRackStatusListener } from "./InsertFxRack";
import { InsertFxRack } from "./InsertFxRack";
import type { EffectParamKey, EffectSlot } from "./effects";
import { createEffectSlot } from "./effects";
import { VoiceManager } from "./VoiceManager";

export const INSERT_FX_WORKLET_URL = new URL(
  "../../audio/insertFxProcessor.ts",
  import.meta.url,
).toString();

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

const LEGACY_TREMOLO_SLOT_ID = "legacy-tremolo";

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private preFxGain: GainNode | null = null;
  private insertFxRack: InsertFxRack | null = null;
  private insertFxStatusListener: InsertFxRackStatusListener | null = null;
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
      !!this.preFxGain &&
      !!this.insertFxRack
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

    const preFxGain = ac.createGain();
    preFxGain.gain.setValueAtTime(0.5, ac.currentTime);

    const insertFxRack = new InsertFxRack(ac);
    if (this.insertFxStatusListener) {
      insertFxRack.setStatusListener(this.insertFxStatusListener);
    }
    preFxGain.connect(insertFxRack.input);
    insertFxRack.output.connect(analyser);

    this.audioContext = ac;
    this.masterVolume = masterVolume;
    this.analyser = analyser;
    this.preFxGain = preFxGain;
    this.insertFxRack = insertFxRack;

    const legacyTremoloSlot = createEffectSlot(LEGACY_TREMOLO_SLOT_ID, "tremolo", {
      rate: this.params.tremoloFrequency,
      depth: this.params.tremoloDepth,
      mix: 1,
    });
    legacyTremoloSlot.collapsed = true;
    insertFxRack.setChain([legacyTremoloSlot]);
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
    this.insertFxRack?.dispose();
    this.preFxGain?.disconnect();
    this.analyser?.disconnect();
    this.masterVolume?.disconnect();
    await this.audioContext.close();
    this.audioContext = null;
    this.masterVolume = null;
    this.analyser = null;
    this.preFxGain = null;
    this.insertFxRack = null;
  }

  async loadWorklet(moduleUrl = INSERT_FX_WORKLET_URL, wasmBytes?: ArrayBuffer) {
    if (!this.audioContext || !this.insertFxRack) {
      throw new Error("AudioEngine is not initialized.");
    }
    await this.insertFxRack.initWorklet(moduleUrl, { wasmBytes });
  }

  setInsertFxStatusListener(listener: InsertFxRackStatusListener | null) {
    this.insertFxStatusListener = listener;
    this.insertFxRack?.setStatusListener(listener);
  }

  setMasterGain(value: number) {
    this.params.masterGain = value;
    if (!this.audioContext || !this.masterVolume) return;
    this.masterVolume.gain.setValueAtTime(value, this.audioContext.currentTime);
  }

  setTremoloDepth(value: number) {
    this.params.tremoloDepth = value;
    if (!this.insertFxRack) return;
    this.insertFxRack.updateEffectParam(LEGACY_TREMOLO_SLOT_ID, "depth", value);
  }

  setTremoloFrequency(value: number) {
    this.params.tremoloFrequency = value;
    if (!this.insertFxRack) return;
    this.insertFxRack.updateEffectParam(LEGACY_TREMOLO_SLOT_ID, "rate", value);
  }

  setWaveform(value: Waveform) {
    this.params.waveform = value;
    this.voiceManager.setWaveformForAll(value);
  }

  setInsertChain(slots: EffectSlot[]) {
    if (!this.insertFxRack) return;
    this.insertFxRack.setChain(slots);
  }

  updateEffectParam(id: string, key: EffectParamKey, value: number) {
    if (!this.insertFxRack) return;
    this.insertFxRack.updateEffectParam(id, key, value);
  }

  toggleEffect(id: string, enabled: boolean) {
    if (!this.insertFxRack) return;
    this.insertFxRack.toggleEffect(id, enabled);
  }

  moveEffect(id: string, direction: "up" | "down") {
    if (!this.insertFxRack) return;
    this.insertFxRack.moveEffect(id, direction);
  }

  removeEffect(id: string) {
    if (!this.insertFxRack) return;
    this.insertFxRack.removeEffect(id);
  }

  startVoice(tone: Tone) {
    if (!this.audioContext || !this.preFxGain) return;
    this.voiceManager.startVoice(tone, this.audioContext, this.preFxGain, this.params.waveform);
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
