type EffectSlot = {
  id: string;
  type?: string;
  enabled?: boolean;
  params?: Record<string, number>;
};

const EFFECT_TYPE_IDS: Record<string, number> = {
  none: 0,
  distortion: 1,
  delay: 2,
  reverb: 3,
  tremolo: 4,
};

class InsertFxProcessor extends AudioWorkletProcessor {
  private chain: EffectSlot[] = [];
  private slotIndexById = new Map<string, number>();
  private wasmReady = false;
  private memory: WebAssembly.Memory | null = null;
  private processFn:
    | ((inputPtr: number, outputPtr: number, frames: number, channels: number) => void)
    | null = null;
  private initFn: ((sampleRate: number, channels: number) => void) | null = null;
  private setChainLenFn: ((len: number) => void) | null = null;
  private setSlotFn:
    | ((
        index: number,
        effectType: number,
        enabled: number,
        p0: number,
        p1: number,
        p2: number,
      ) => void)
    | null = null;
  private inputPtr = 0;
  private outputPtr = 0;
  private bufferFrames = 0;
  private bufferChannels = 0;
  private maxChannels = 2;

  constructor(options?: AudioWorkletNodeOptions) {
    super();

    this.port.onmessage = (event) => {
      this.handleMessage(event?.data as Record<string, unknown> | undefined);
    };

    const processorOptions = options?.processorOptions as { wasmBytes?: ArrayBuffer } | undefined;
    if (processorOptions?.wasmBytes) {
      this.loadWasm(processorOptions.wasmBytes);
    }
  }

  private handleMessage(data?: Record<string, unknown>) {
    if (!data || typeof data.type !== "string") return;
    if (data.type === "loadWasm") {
      this.loadWasm(data.wasmBytes as ArrayBuffer);
      return;
    }
    if (data.type === "setChain") {
      this.chain = Array.isArray(data.slots) ? (data.slots as EffectSlot[]) : [];
      this.applyChainToWasm();
      return;
    }
    if (data.type === "setParam") {
      this.setParam(data.id as string, data.key as string, data.value as number);
      return;
    }
    if (data.type === "setEnabled") {
      this.setEnabled(data.id as string, data.enabled as boolean);
    }
  }

  private setParam(id: string, key: string, value: number) {
    const slot = this.findSlot(id);
    if (!slot || !slot.params || typeof key !== "string") return;
    slot.params[key] = value;
    this.applySlotUpdate(id);
  }

  private setEnabled(id: string, enabled: boolean) {
    const slot = this.findSlot(id);
    if (!slot) return;
    slot.enabled = !!enabled;
    this.applySlotUpdate(id);
  }

  private findSlot(id: string) {
    for (let i = 0; i < this.chain.length; i += 1) {
      if (this.chain[i].id === id) {
        return this.chain[i];
      }
    }
    return null;
  }

  private loadWasm(wasmBytes?: ArrayBuffer | Uint8Array) {
    if (!wasmBytes) return;
    const bytes = wasmBytes instanceof Uint8Array ? wasmBytes : wasmBytes;

    this.wasmReady = false;
    WebAssembly.instantiate(bytes, {})
      .then((result) => {
        const instance = (result as WebAssembly.WebAssemblyInstantiatedSource).instance || result;
        const exports = (instance as WebAssembly.Instance).exports as Record<string, unknown>;
        if (!exports.memory || typeof exports.process !== "function") {
          this.port.postMessage({
            type: "error",
            message: "Invalid WASM exports",
          });
          return;
        }
        this.memory = exports.memory as WebAssembly.Memory;
        this.processFn = exports.process as (
          inputPtr: number,
          outputPtr: number,
          frames: number,
          channels: number,
        ) => void;
        this.initFn =
          typeof exports.init === "function"
            ? (exports.init as (sampleRate: number, channels: number) => void)
            : null;
        this.setChainLenFn =
          typeof exports.set_chain_len === "function"
            ? (exports.set_chain_len as (len: number) => void)
            : null;
        this.setSlotFn =
          typeof exports.set_slot === "function"
            ? (exports.set_slot as (
                index: number,
                effectType: number,
                enabled: number,
                p0: number,
                p1: number,
                p2: number,
              ) => void)
            : null;
        if (this.initFn) {
          this.initFn(sampleRate, this.maxChannels);
        }
        this.wasmReady = true;
        this.applyChainToWasm();
        this.port.postMessage({ type: "ready" });
      })
      .catch(() => {
        this.port.postMessage({
          type: "error",
          message: "WASM instantiate failed",
        });
      });
  }

  private applyChainToWasm() {
    if (!this.wasmReady || !this.setChainLenFn || !this.setSlotFn) return;
    this.setChainLenFn(this.chain.length);
    this.slotIndexById.clear();
    for (let i = 0; i < this.chain.length; i += 1) {
      const slot = this.chain[i];
      this.slotIndexById.set(slot.id, i);
      this.applySlotToWasm(i, slot);
    }
  }

  private applySlotUpdate(id: string) {
    if (!this.wasmReady || !this.setSlotFn) return;
    const index = this.slotIndexById.get(id);
    if (index === undefined) return;
    const slot = this.chain[index];
    if (!slot) return;
    this.applySlotToWasm(index, slot);
  }

  private applySlotToWasm(index: number, slot: EffectSlot) {
    if (!this.setSlotFn) return;
    const effectTypeId =
      typeof slot.type === "string" ? EFFECT_TYPE_IDS[slot.type] ?? 0 : 0;
    const enabled = slot.enabled ? 1 : 0;
    const params = slot.params ?? {};
    let p0 = 0;
    let p1 = 0;
    let p2 = 0;
    switch (slot.type) {
      case "distortion":
        p0 = params.drive ?? 0;
        p1 = params.tone ?? 0;
        p2 = params.mix ?? 0;
        break;
      case "delay":
        p0 = params.time ?? 0;
        p1 = params.feedback ?? 0;
        p2 = params.mix ?? 0;
        break;
      case "reverb":
        p0 = params.room ?? 0;
        p1 = params.damping ?? 0;
        p2 = params.mix ?? 0;
        break;
      case "tremolo":
        p0 = params.rate ?? 0;
        p1 = params.depth ?? 0;
        p2 = params.mix ?? 0;
        break;
      default:
        break;
    }
    this.setSlotFn(index, effectTypeId, enabled, p0, p1, p2);
  }

  private ensureCapacity(frames: number, channels: number) {
    if (!this.memory) return;
    if (frames <= this.bufferFrames && channels <= this.bufferChannels) return;
    this.bufferFrames = frames;
    this.bufferChannels = channels;
    const bytes = frames * channels * 4 * 2;
    const current = this.memory.buffer.byteLength;
    if (bytes > current) {
      const needed = bytes - current;
      const pages = Math.ceil(needed / 65536);
      this.memory.grow(pages);
    }
    this.inputPtr = 0;
    this.outputPtr = frames * channels * 4;
  }

  private copyInputToOutput(
    input: Float32Array[],
    output: Float32Array[],
    channels: number,
  ) {
    for (let c = 0; c < channels; c += 1) {
      output[c].set(input[c]);
    }
    for (let c = channels; c < output.length; c += 1) {
      output[c].fill(0);
    }
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][]) {
    const input = inputs[0];
    const output = outputs[0];
    if (!output || output.length === 0) return true;
    if (!input || input.length === 0) {
      for (let c = 0; c < output.length; c += 1) {
        output[c].fill(0);
      }
      return true;
    }

    const channels = Math.min(input.length, output.length);
    const frames = input[0].length;
    if (!this.wasmReady || !this.memory || !this.processFn) {
      this.copyInputToOutput(input, output, channels);
      return true;
    }

    this.ensureCapacity(frames, channels);

    const total = frames * channels;
    const interleaved = new Float32Array(this.memory.buffer, this.inputPtr, total);
    const outInterleaved = new Float32Array(this.memory.buffer, this.outputPtr, total);

    let index = 0;
    for (let i = 0; i < frames; i += 1) {
      for (let c = 0; c < channels; c += 1) {
        interleaved[index] = input[c][i];
        index += 1;
      }
    }

    this.processFn(this.inputPtr, this.outputPtr, frames, channels);

    index = 0;
    for (let i = 0; i < frames; i += 1) {
      for (let c = 0; c < channels; c += 1) {
        output[c][i] = outInterleaved[index];
        index += 1;
      }
    }

    for (let c = channels; c < output.length; c += 1) {
      output[c].fill(0);
    }

    return true;
  }
}

registerProcessor("insert-fx-processor", InsertFxProcessor);
