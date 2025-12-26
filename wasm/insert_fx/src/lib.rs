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
    output.copy_from_slice(input);
}

#[no_mangle]
pub extern "C" fn version() -> u32 {
    1
}
