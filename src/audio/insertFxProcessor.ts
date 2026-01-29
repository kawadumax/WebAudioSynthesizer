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
  private processFn: ((frames: number, channels: number) => void) | null = null;
  private allocBuffersFn: ((len: number) => void) | null = null;
  private getInputPtrFn: (() => number) | null = null;
  private getOutputPtrFn: (() => number) | null = null;
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

  private maxChannels = 2;

  constructor(options?: AudioWorkletNodeOptions) {
    super();

    this.port.onmessage = (event: MessageEvent) => {
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
        const resolved = result as WebAssembly.WebAssemblyInstantiatedSource | WebAssembly.Instance;
        const instance = "instance" in resolved ? resolved.instance : resolved;
        const exports = instance.exports as Record<string, unknown>;

        // Check required exports
        if (
          !exports.memory ||
          typeof exports.process_buffers !== "function" ||
          typeof exports.alloc_buffers !== "function" ||
          typeof exports.get_input_ptr !== "function" ||
          typeof exports.get_output_ptr !== "function"
        ) {
          this.port.postMessage({
            type: "error",
            message: "Invalid WASM exports (missing v3 functions)",
          });
          return;
        }

        this.memory = exports.memory as WebAssembly.Memory;
        this.processFn = exports.process_buffers as (frames: number, channels: number) => void;
        this.allocBuffersFn = exports.alloc_buffers as (len: number) => void;
        this.getInputPtrFn = exports.get_input_ptr as () => number;
        this.getOutputPtrFn = exports.get_output_ptr as () => number;

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
      .catch((e) => {
        this.port.postMessage({
          type: "error",
          message: `WASM instantiate failed: ${e}`,
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
    const effectTypeId = typeof slot.type === "string" ? (EFFECT_TYPE_IDS[slot.type] ?? 0) : 0;
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

  private copyInputToOutput(input: Float32Array[], output: Float32Array[], channels: number) {
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
    const channels = output ? output.length : 0;
    const frames = output && output[0] ? output[0].length : 0;

    if (!output || output.length === 0) return true;
    if (!input || input.length === 0) {
      for (let c = 0; c < output.length; c += 1) {
        output[c].fill(0);
      }
      return true;
    }

    if (
      !this.wasmReady ||
      !this.processFn ||
      !this.allocBuffersFn ||
      !this.getInputPtrFn ||
      !this.getOutputPtrFn ||
      !this.memory
    ) {
      this.copyInputToOutput(input, output, channels);
      return true;
    }

    // Ensure WASM buffers are large enough
    const totalSamples = frames * channels;
    this.allocBuffersFn(totalSamples);

    const inputPtr = this.getInputPtrFn();
    const outputPtr = this.getOutputPtrFn();

    // Create views on the WASM memory
    const wasmInput = new Float32Array(this.memory.buffer, inputPtr, totalSamples);
    const wasmOutput = new Float32Array(this.memory.buffer, outputPtr, totalSamples);

    // Interleave and copy input to WASM
    let index = 0;
    for (let i = 0; i < frames; i += 1) {
      for (let c = 0; c < channels; c += 1) {
        wasmInput[index] = input[c][i];
        index += 1;
      }
    }

    // Process
    this.processFn(frames, channels);

    // De-interleave and copy output
    index = 0;
    for (let i = 0; i < frames; i += 1) {
      for (let c = 0; c < channels; c += 1) {
        output[c][i] = wasmOutput[index];
        index += 1;
      }
    }

    // Silence remaining output channels
    for (let c = channels; c < output.length; c += 1) {
      output[c].fill(0);
    }

    return true;
  }
}

registerProcessor("insert-fx-processor", InsertFxProcessor);
