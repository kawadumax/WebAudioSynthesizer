use std::f32::consts::PI;

const EFFECT_NONE: u32 = 0;
const EFFECT_DISTORTION: u32 = 1;
const EFFECT_DELAY: u32 = 2;
const EFFECT_REVERB: u32 = 3;
const EFFECT_TREMOLO: u32 = 4;

const MAX_SLOTS: usize = 8;
const MAX_DELAY_SECONDS: f32 = 2.0;
const BASE_REVERB_DELAYS_SECS: [f32; 3] = [0.0297, 0.0371, 0.0411];

#[derive(Clone, Copy)]
struct Slot {
    effect_type: u32,
    enabled: bool,
    p0: f32,
    p1: f32,
    p2: f32,
}

impl Default for Slot {
    fn default() -> Self {
        Self {
            effect_type: EFFECT_NONE,
            enabled: false,
            p0: 0.0,
            p1: 0.0,
            p2: 0.0,
        }
    }
}

struct DelayState {
    buffers: Vec<Vec<f32>>,
    write_index: usize,
    max_samples: usize,
}

impl DelayState {
    fn new(sample_rate: f32, channels: usize) -> Self {
        let max_samples = (MAX_DELAY_SECONDS * sample_rate).max(1.0) as usize;
        let buffers = vec![vec![0.0; max_samples]; channels.max(1)];
        Self {
            buffers,
            write_index: 0,
            max_samples,
        }
    }
}

struct ReverbState {
    comb_buffers: Vec<Vec<Vec<f32>>>,
    comb_indices: Vec<Vec<usize>>,
    comb_lp: Vec<Vec<f32>>,
    comb_lengths: Vec<usize>,
}

impl ReverbState {
    fn new(sample_rate: f32, channels: usize) -> Self {
        let comb_lengths: Vec<usize> = BASE_REVERB_DELAYS_SECS
            .iter()
            .map(|sec| (sec * sample_rate).max(1.0) as usize)
            .collect();
        let comb_count = comb_lengths.len();
        let mut comb_buffers = Vec::with_capacity(channels.max(1));
        let mut comb_indices = Vec::with_capacity(channels.max(1));
        let mut comb_lp = Vec::with_capacity(channels.max(1));
        for _ in 0..channels.max(1) {
            let mut channel_buffers = Vec::with_capacity(comb_count);
            let channel_indices = vec![0; comb_count];
            let channel_lp = vec![0.0; comb_count];
            for &len in &comb_lengths {
                channel_buffers.push(vec![0.0; len]);
            }
            comb_buffers.push(channel_buffers);
            comb_indices.push(channel_indices);
            comb_lp.push(channel_lp);
        }
        Self {
            comb_buffers,
            comb_indices,
            comb_lp,
            comb_lengths,
        }
    }
}

struct State {
    sample_rate: f32,
    channels: usize,
    chain_len: usize,
    slots: [Slot; MAX_SLOTS],
    delay: DelayState,
    reverb: ReverbState,
    tremolo_phase: f32,
    distortion_lp: Vec<f32>,
}

impl State {
    fn new(sample_rate: f32, channels: usize) -> Self {
        let channels = channels.max(1);
        Self {
            sample_rate,
            channels,
            chain_len: 0,
            slots: [Slot::default(); MAX_SLOTS],
            delay: DelayState::new(sample_rate, channels),
            reverb: ReverbState::new(sample_rate, channels),
            tremolo_phase: 0.0,
            distortion_lp: vec![0.0; channels],
        }
    }
}

static mut STATE: Option<State> = None;

fn clamp(value: f32, min: f32, max: f32) -> f32 {
    if value < min {
        min
    } else if value > max {
        max
    } else {
        value
    }
}

fn mix(dry: f32, wet: f32, mix: f32) -> f32 {
    dry * (1.0 - mix) + wet * mix
}

fn process_distortion(state: &mut State, sample: f32, channel: usize, slot: Slot) -> f32 {
    let drive = clamp(slot.p0, 0.0, 1.0);
    let tone = clamp(slot.p1, 0.0, 1.0);
    let mix_value = clamp(slot.p2, 0.0, 1.0);
    let drive_amount = 1.0 + drive * 10.0;
    let shaped = (sample * drive_amount) / (1.0 + (sample * drive_amount).abs());
    let alpha = 0.05 + tone * 0.45;
    let prev = state.distortion_lp[channel];
    let filtered = prev + alpha * (shaped - prev);
    state.distortion_lp[channel] = filtered;
    mix(sample, filtered, mix_value)
}

fn process_delay(
    state: &mut State,
    sample: f32,
    channel: usize,
    slot: Slot,
    write_index: usize,
) -> f32 {
    let time = clamp(slot.p0, 0.0, 1.0);
    let feedback = clamp(slot.p1, 0.0, 0.95);
    let mix_value = clamp(slot.p2, 0.0, 1.0);
    let max_samples = state.delay.max_samples;
    let delay_samples = ((max_samples - 1) as f32 * time).max(1.0) as usize;
    let read_index = if write_index >= delay_samples {
        write_index - delay_samples
    } else {
        max_samples + write_index - delay_samples
    };
    let buffer = &mut state.delay.buffers[channel];
    let delayed = buffer[read_index];
    buffer[write_index] = sample + delayed * feedback;
    mix(sample, delayed, mix_value)
}

fn process_reverb(state: &mut State, sample: f32, channel: usize, slot: Slot) -> f32 {
    let room = clamp(slot.p0, 0.0, 1.0);
    let damping = clamp(slot.p1, 0.0, 1.0);
    let mix_value = clamp(slot.p2, 0.0, 1.0);
    let feedback = 0.2 + room * 0.7;
    let comb_count = state.reverb.comb_lengths.len();
    let mut sum = 0.0;
    for comb in 0..comb_count {
        let index = state.reverb.comb_indices[channel][comb];
        let delayed = state.reverb.comb_buffers[channel][comb][index];
        let prev = state.reverb.comb_lp[channel][comb];
        let damped = prev + damping * (delayed - prev);
        state.reverb.comb_lp[channel][comb] = damped;
        state.reverb.comb_buffers[channel][comb][index] = sample + damped * feedback;
        state.reverb.comb_indices[channel][comb] =
            (index + 1) % state.reverb.comb_lengths[comb];
        sum += delayed;
    }
    let wet = sum / comb_count as f32;
    mix(sample, wet, mix_value)
}

fn process_tremolo(state: &mut State, sample: f32, channel: usize, slot: Slot) -> f32 {
    let rate = clamp(slot.p0, 0.0, 20.0);
    let depth = clamp(slot.p1, 0.0, 1.0);
    let mix_value = clamp(slot.p2, 0.0, 1.0);
    let phase = state.tremolo_phase;
    let modulator = 1.0 - depth + depth * 0.5 * (phase.sin() + 1.0);
    if channel == 0 {
        let phase_inc = 2.0 * PI * rate / state.sample_rate.max(1.0);
        let mut next = phase + phase_inc;
        if next >= 2.0 * PI {
            next -= 2.0 * PI;
        }
        state.tremolo_phase = next;
    }
    mix(sample, sample * modulator, mix_value)
}

#[no_mangle]
pub extern "C" fn init(sample_rate: f32, channels: usize) {
    unsafe {
        STATE = Some(State::new(sample_rate, channels));
    }
}

#[no_mangle]
pub extern "C" fn set_chain_len(len: usize) {
    unsafe {
        if let Some(state) = STATE.as_mut() {
            state.chain_len = len.min(MAX_SLOTS);
        }
    }
}

#[no_mangle]
pub extern "C" fn set_slot(
    index: usize,
    effect_type: u32,
    enabled: u32,
    p0: f32,
    p1: f32,
    p2: f32,
) {
    unsafe {
        if let Some(state) = STATE.as_mut() {
            if index >= MAX_SLOTS {
                return;
            }
            state.slots[index] = Slot {
                effect_type,
                enabled: enabled != 0 && effect_type != EFFECT_NONE,
                p0,
                p1,
                p2,
            };
        }
    }
}

#[no_mangle]
pub extern "C" fn process(
    input_ptr: *const f32,
    output_ptr: *mut f32,
    frames: usize,
    channels: usize,
) {
    if input_ptr.is_null() || output_ptr.is_null() {
        return;
    }
    let total = frames.saturating_mul(channels);
    let input = unsafe { std::slice::from_raw_parts(input_ptr, total) };
    let output = unsafe { std::slice::from_raw_parts_mut(output_ptr, total) };
    let Some(state) = (unsafe { STATE.as_mut() }) else {
        output.copy_from_slice(input);
        return;
    };
    let active_channels = channels.min(state.channels).max(1);
    for frame in 0..frames {
        let write_index = state.delay.write_index;
        for channel in 0..channels {
            let index = frame * channels + channel;
            let mut sample = input[index];
            if channel < active_channels {
                for slot_index in 0..state.chain_len {
                    let slot = state.slots[slot_index];
                    if !slot.enabled {
                        continue;
                    }
                    sample = match slot.effect_type {
                        EFFECT_DISTORTION => process_distortion(state, sample, channel, slot),
                        EFFECT_DELAY => process_delay(state, sample, channel, slot, write_index),
                        EFFECT_REVERB => process_reverb(state, sample, channel, slot),
                        EFFECT_TREMOLO => process_tremolo(state, sample, channel, slot),
                        _ => sample,
                    };
                }
            }
            output[index] = sample;
        }
        state.delay.write_index = (write_index + 1) % state.delay.max_samples;
    }
}

#[no_mangle]
pub extern "C" fn version() -> u32 {
    2
}
