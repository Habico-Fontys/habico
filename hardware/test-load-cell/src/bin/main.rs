#![no_std]
#![no_main]
#![deny(
    clippy::mem_forget,
    reason = "mem::forget is generally not safe to do with esp_hal types, especially those \
    holding buffers for the duration of a data transfer."
)]
#![deny(clippy::large_stack_frames)]

use defmt::{info, warn};
use esp_hal::clock::CpuClock;
use esp_hal::delay::Delay;
use esp_hal::gpio::{Input, InputConfig, Level, Output, OutputConfig, Pull};
use esp_hal::main;
use esp_hal::timer::timg::TimerGroup;
use panic_rtt_target as _;
use test_load_cell::hx711::{Gain, Hx711};

extern crate alloc;

esp_bootloader_esp_idf::esp_app_desc!();

const TARE_SAMPLES: u32 = 20;
const MEASURE_SAMPLES: u32 = 5;
/// Raw counts per gram; calibrate by placing a known weight and computing `raw / grams`.
const COUNTS_PER_GRAM: f32 = 41.8;
/// The bridge and its resistors drift while warming up after power-on.
const WARM_UP_MS: u32 = 5000;

#[allow(
    clippy::large_stack_frames,
    reason = "it's not unusual to allocate larger buffers etc. in main"
)]
#[main]
fn main() -> ! {
    rtt_target::rtt_init_defmt!();

    let config = esp_hal::Config::default().with_cpu_clock(CpuClock::max());
    let peripherals = esp_hal::init(config);

    // Strapping pins (avoid): GPIO4, GPIO5, GPIO8, GPIO9, GPIO15.
    // GPIO24–GPIO30 are used by the module's flash and must not be touched.
    let _ = peripherals.GPIO24;
    let _ = peripherals.GPIO25;
    let _ = peripherals.GPIO26;
    let _ = peripherals.GPIO27;
    let _ = peripherals.GPIO28;
    let _ = peripherals.GPIO29;
    let _ = peripherals.GPIO30;

    esp_alloc::heap_allocator!(#[esp_hal::ram(reclaimed)] size: 65536);

    let timg0 = TimerGroup::new(peripherals.TIMG0);
    let sw_interrupt =
        esp_hal::interrupt::software::SoftwareInterruptControl::new(peripherals.SW_INTERRUPT);
    esp_rtos::start(timg0.timer0, sw_interrupt.software_interrupt0);
    let (mut _wifi_controller, _interfaces) =
        esp_radio::wifi::new(peripherals.WIFI, Default::default())
            .expect("Failed to initialize Wi-Fi controller");

    let dt = Input::new(
        peripherals.GPIO19,
        InputConfig::default().with_pull(Pull::None),
    );
    let sck = Output::new(peripherals.GPIO18, Level::Low, OutputConfig::default());
    let mut scale = Hx711::new(dt, sck, Gain::ChannelA128);
    let delay = Delay::new();

    delay.delay_millis(WARM_UP_MS);

    let tare = loop {
        match scale.init().and_then(|()| scale.read_average(TARE_SAMPLES)) {
            Ok(tare) => break tare,
            Err(_) => {
                warn!("HX711 not responding; check VCC/GND, DT wiring and E- to GND");
                delay.delay_millis(1000);
            }
        }
    };
    info!("tare = {}", tare);

    loop {
        match scale.read_average(MEASURE_SAMPLES) {
            Ok(reading) => {
                // The cell is wired so that load lowers the reading.
                let net = tare - reading;
                let grams = net as f32 / COUNTS_PER_GRAM;
                info!(
                    "hx711 {} | net {} | {=f32} g | {=f32} kg",
                    reading,
                    net,
                    grams,
                    grams / 1000.0
                );
            }
            Err(_) => warn!("HX711 read timed out"),
        }
        delay.delay_millis(100);
    }
}
