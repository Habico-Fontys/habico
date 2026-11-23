use core::marker::PhantomData;

use esp_hal::Blocking;
use esp_hal::i2c::master::{I2c, Operation};
use esp_hal::time::{Duration, Instant};

#[allow(
    non_camel_case_types,
    non_snake_case,
    non_upper_case_globals,
    dead_code,
    clippy::all
)]
mod sys {
    include!(concat!(env!("OUT_DIR"), "/vl53l7cx_bindings.rs"));
}

pub use sys::VL53L7CX_Platform;

pub const DEFAULT_ADDRESS: u8 = 0x29;

const STATUS_OK: u8 = 0;
const STATUS_ERROR: u8 = 255;

type Bus = I2c<'static, Blocking>;

pub struct Vl53l7cx<'a> {
    dev: sys::VL53L7CX_Configuration,
    _bus: PhantomData<&'a mut Bus>,
}

impl<'a> Vl53l7cx<'a> {
    pub fn new(bus: &'a mut Bus, address: u8) -> Self {
        // SAFETY: the configuration is plain C data for which all-zero is a valid value.
        let mut dev: sys::VL53L7CX_Configuration = unsafe { core::mem::zeroed() };
        dev.platform.address = address.into();
        dev.platform.bus = (bus as *mut Bus).cast();
        Self {
            dev,
            _bus: PhantomData,
        }
    }

    pub fn is_alive(&mut self) -> Result<bool, u8> {
        let mut is_alive = 0;
        // SAFETY: `dev.platform.bus` points to a bus borrowed for `'a`, which outlives `self`.
        let status = unsafe { sys::vl53l7cx_is_alive(&mut self.dev, &mut is_alive) };
        match status {
            STATUS_OK => Ok(is_alive != 0),
            error => Err(error),
        }
    }
}

/// # Safety
/// `platform` must come from a live `Vl53l7cx`, so `bus` points to a borrowed `Bus`.
unsafe fn platform_bus<'p>(platform: *mut VL53L7CX_Platform) -> (&'p mut Bus, u8) {
    let platform = unsafe { &mut *platform };
    let bus = unsafe { &mut *platform.bus.cast::<Bus>() };
    (bus, platform.address as u8)
}

fn status<E>(result: Result<(), E>) -> u8 {
    match result {
        Ok(()) => STATUS_OK,
        Err(_) => STATUS_ERROR,
    }
}

#[unsafe(no_mangle)]
unsafe extern "C" fn VL53L7CX_RdByte(
    platform: *mut VL53L7CX_Platform,
    register: u16,
    value: *mut u8,
) -> u8 {
    unsafe { VL53L7CX_RdMulti(platform, register, value, 1) }
}

#[unsafe(no_mangle)]
unsafe extern "C" fn VL53L7CX_WrByte(
    platform: *mut VL53L7CX_Platform,
    register: u16,
    mut value: u8,
) -> u8 {
    unsafe { VL53L7CX_WrMulti(platform, register, &mut value, 1) }
}

#[unsafe(no_mangle)]
unsafe extern "C" fn VL53L7CX_RdMulti(
    platform: *mut VL53L7CX_Platform,
    register: u16,
    values: *mut u8,
    size: u32,
) -> u8 {
    let (bus, address) = unsafe { platform_bus(platform) };
    let buffer = unsafe { core::slice::from_raw_parts_mut(values, size as usize) };
    status(bus.write_read(address, &register.to_be_bytes(), buffer))
}

#[unsafe(no_mangle)]
unsafe extern "C" fn VL53L7CX_WrMulti(
    platform: *mut VL53L7CX_Platform,
    register: u16,
    values: *mut u8,
    size: u32,
) -> u8 {
    let (bus, address) = unsafe { platform_bus(platform) };
    let data = unsafe { core::slice::from_raw_parts(values, size as usize) };
    let register = register.to_be_bytes();
    status(bus.transaction(
        address,
        &mut [Operation::Write(&register), Operation::Write(data)],
    ))
}

#[unsafe(no_mangle)]
extern "C" fn VL53L7CX_Reset_Sensor(_platform: *mut VL53L7CX_Platform) -> u8 {
    STATUS_OK
}

#[unsafe(no_mangle)]
unsafe extern "C" fn VL53L7CX_SwapBuffer(buffer: *mut u8, size: u16) {
    let buffer = unsafe { core::slice::from_raw_parts_mut(buffer, size as usize) };
    for word in buffer.as_chunks_mut::<4>().0 {
        word.reverse();
    }
}

#[unsafe(no_mangle)]
extern "C" fn VL53L7CX_WaitMs(_platform: *mut VL53L7CX_Platform, time_ms: u32) -> u8 {
    let start = Instant::now();
    let duration = Duration::from_millis(time_ms.into());
    while start.elapsed() < duration {}
    STATUS_OK
}
