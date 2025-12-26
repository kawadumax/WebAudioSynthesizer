import type { EffectParamKey, EffectParamsMap, EffectSlot, EffectType } from "./effects";
import { DEFAULT_EFFECT_PARAMS } from "./effects";

type WorkletEffectSlot = {
  id: string;
  type: EffectType;
  enabled: boolean;
  params: EffectParamsMap[EffectType];
};

type InsertFxWorkletMessage =
  | { type: "loadWasm"; wasmBytes: ArrayBuffer }
  | { type: "setChain"; slots: WorkletEffectSlot[] }
  | { type: "setParam"; id: string; key: EffectParamKey; value: number }
  | { type: "setEnabled"; id: string; enabled: boolean };

export type InsertFxRackStatus = {
  type: "ready" | "error";
  message?: string;
};

export type InsertFxRackStatusListener = (status: InsertFxRackStatus) => void;

export type InsertFxRackOptions = {
  processorName?: string;
  wasmBytes?: ArrayBuffer;
};

export class InsertFxRack {
  private audioContext: AudioContext;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private workletNode: AudioWorkletNode | null = null;
  private processorName: string;
  private slots: EffectSlot[] = [];
  private workletReady = false;
  private workletFailed = false;
  private pendingWasmBytes: ArrayBuffer | null = null;
  private statusListener: InsertFxRackStatusListener | null = null;

  constructor(audioContext: AudioContext, options: InsertFxRackOptions = {}) {
    this.audioContext = audioContext;
    this.processorName = options.processorName ?? "insert-fx-processor";
    this.pendingWasmBytes = options.wasmBytes ?? null;
    this.inputNode = this.audioContext.createGain();
    this.outputNode = this.audioContext.createGain();
    this.setBypassConnection();
  }

  get input(): AudioNode {
    return this.inputNode;
  }

  get output(): AudioNode {
    return this.outputNode;
  }

  getSlots(): EffectSlot[] {
    return this.slots.map((slot) => this.cloneSlot(slot));
  }

  getSlotById(id: string): EffectSlot | null {
    const slot = this.slots.find((item) => item.id === id);
    return slot ? this.cloneSlot(slot) : null;
  }

  isWorkletReady(): boolean {
    return this.workletReady;
  }

  hasWorkletFailed(): boolean {
    return this.workletFailed;
  }

  setStatusListener(listener: InsertFxRackStatusListener | null): void {
    this.statusListener = listener;
  }

  async initWorklet(moduleUrl: string, options: InsertFxRackOptions = {}): Promise<void> {
    if (this.workletNode || this.workletFailed) return;
    if (options.processorName) {
      this.processorName = options.processorName;
    }
    if (options.wasmBytes) {
      this.pendingWasmBytes = options.wasmBytes;
    }
    try {
      await this.audioContext.audioWorklet.addModule(moduleUrl);
      const nodeOptions = this.pendingWasmBytes
        ? { processorOptions: { wasmBytes: this.pendingWasmBytes } }
        : undefined;
      const workletNode = new AudioWorkletNode(
        this.audioContext,
        this.processorName,
        nodeOptions,
      );
      workletNode.port.onmessage = (event) => {
        const data = event.data as { type?: string; message?: string } | undefined;
        if (!data || typeof data.type !== "string") return;
        if (data.type === "ready") {
          this.emitStatus({ type: "ready" });
          return;
        }
        if (data.type === "error") {
          this.emitStatus({ type: "error", message: data.message });
        }
      };
      this.workletNode = workletNode;
      this.workletReady = true;
      this.setWorkletConnection();
      this.sendChain();
    } catch {
      this.workletFailed = true;
      this.workletReady = false;
      this.setBypassConnection();
      this.emitStatus({ type: "error", message: "AudioWorklet initialization failed." });
    }
  }

  setChain(slots: EffectSlot[]): void {
    this.slots = slots.map((slot) => this.normalizeSlot(slot));
    this.sendChain();
  }

  setWasmBytes(wasmBytes: ArrayBuffer): void {
    this.pendingWasmBytes = wasmBytes;
    if (!this.workletNode) return;
    this.sendMessage({ type: "loadWasm", wasmBytes });
  }

  updateEffectParam(id: string, key: EffectParamKey, value: number): void {
    const slot = this.slots.find((item) => item.id === id);
    if (!slot) return;
    if (!(key in slot.params)) return;
    (slot.params as Record<string, number>)[key] = value;
    this.sendMessage({ type: "setParam", id, key, value });
  }

  toggleEffect(id: string, enabled: boolean): void {
    const slot = this.slots.find((item) => item.id === id);
    if (!slot) return;
    if (slot.type === "none") return;
    slot.enabled = enabled;
    this.sendMessage({ type: "setEnabled", id, enabled });
  }

  moveEffect(id: string, direction: "up" | "down"): void {
    const index = this.slots.findIndex((item) => item.id === id);
    if (index === -1) return;
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= this.slots.length) return;
    const [slot] = this.slots.splice(index, 1);
    this.slots.splice(nextIndex, 0, slot);
    this.sendChain();
  }

  removeEffect(id: string): void {
    const index = this.slots.findIndex((item) => item.id === id);
    if (index === -1) return;
    this.slots.splice(index, 1);
    this.sendChain();
  }

  dispose(): void {
    this.safeDisconnect(this.inputNode);
    this.safeDisconnect(this.outputNode);
    if (this.workletNode) {
      this.safeDisconnect(this.workletNode);
      this.workletNode.port.close();
    }
    this.workletNode = null;
    this.workletReady = false;
  }

  private normalizeSlot(slot: EffectSlot): EffectSlot {
    const defaults = DEFAULT_EFFECT_PARAMS[slot.type];
    const params = { ...defaults, ...slot.params } as EffectParamsMap[typeof slot.type];
    const enabled = slot.type === "none" ? false : slot.enabled;
    const collapsed = slot.type === "none" ? true : slot.collapsed;
    return { ...slot, enabled, collapsed, params };
  }

  private cloneSlot(slot: EffectSlot): EffectSlot {
    return {
      ...slot,
      params: { ...slot.params } as EffectParamsMap[typeof slot.type],
    };
  }

  private sendMessage(message: InsertFxWorkletMessage): void {
    if (!this.workletNode || !this.workletReady) return;
    this.workletNode.port.postMessage(message);
  }

  private sendChain(): void {
    const slots = this.slots.map((slot) => ({
      id: slot.id,
      type: slot.type,
      enabled: slot.enabled,
      params: slot.params as EffectParamsMap[EffectType],
    }));
    this.sendMessage({ type: "setChain", slots });
  }

  private setBypassConnection(): void {
    this.safeDisconnect(this.inputNode);
    if (this.workletNode) {
      this.safeDisconnect(this.workletNode);
    }
    this.inputNode.connect(this.outputNode);
  }

  private setWorkletConnection(): void {
    if (!this.workletNode) return;
    this.safeDisconnect(this.inputNode);
    this.safeDisconnect(this.workletNode);
    this.inputNode.connect(this.workletNode);
    this.workletNode.connect(this.outputNode);
  }

  private emitStatus(status: InsertFxRackStatus): void {
    if (this.statusListener) {
      this.statusListener(status);
    }
  }

  private safeDisconnect(node: AudioNode): void {
    try {
      node.disconnect();
    } catch {
      // Ignore disconnect errors on partially-connected nodes.
    }
  }
}
