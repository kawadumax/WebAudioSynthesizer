class InsertFxProcessor extends AudioWorkletProcessor {
  private chain: Array<{ id: string; enabled?: boolean; params?: Record<string, number> }> = [];
  private wasmReady = false;
  private memory: WebAssembly.Memory | null = null;
  private processFn: ((inputPtr: number, outputPtr: number, frames: number, channels: number) => void) | null =
    null;
  private inputPtr = 0;
  private outputPtr = 0;
  private bufferFrames = 0;
  private bufferChannels = 0;

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
      this.chain = Array.isArray(data.slots)
        ? (data.slots as Array<{ id: string; enabled?: boolean; params?: Record<string, number> }>)
        : [];
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
  }

  private setEnabled(id: string, enabled: boolean) {
    const slot = this.findSlot(id);
    if (!slot) return;
    slot.enabled = !!enabled;
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
        this.wasmReady = true;
        this.port.postMessage({ type: "ready" });
      })
      .catch(() => {
        this.port.postMessage({
          type: "error",
          message: "WASM instantiate failed",
        });
      });
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
