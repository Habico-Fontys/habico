use esp_hal::{
    delay::Delay,
    gpio::{Input, Output},
    time::{Duration, Instant},
};

const DATA_BITS: u32 = 24;
// One output-rate period is 100 ms at RATE=low; allow a generous margin.
const READY_TIMEOUT: Duration = Duration::from_millis(500);

#[derive(Clone, Copy, Debug, defmt::Format)]
pub enum Gain {
    ChannelA128 = 1,
    ChannelB32 = 2,
    ChannelA64 = 3,
}

#[derive(Clone, Copy, Debug, defmt::Format)]
pub struct Timeout;

pub struct Hx711<'d> {
    dt: Input<'d>,
    sck: Output<'d>,
    delay: Delay,
    gain: Gain,
}

impl<'d> Hx711<'d> {
    pub fn new(dt: Input<'d>, sck: Output<'d>, gain: Gain) -> Self {
        Self {
            dt,
            sck,
            delay: Delay::new(),
            gain,
        }
    }

    /// The first conversion after power-up or a gain change still uses the
    /// previous gain setting, so its result is discarded.
    pub fn init(&mut self) -> Result<(), Timeout> {
        self.read_raw().map(drop)
    }

    pub fn read_raw(&mut self) -> Result<i32, Timeout> {
        self.wait_ready()?;
        // SCK high for more than 60 µs powers the chip down, so interrupts
        // (Wi-Fi, scheduler) must not preempt the bit-bang sequence.
        let raw = critical_section::with(|_| {
            let mut value: u32 = 0;
            for _ in 0..DATA_BITS {
                self.sck.set_high();
                self.delay.delay_micros(1);
                value = (value << 1) | self.dt.is_high() as u32;
                self.sck.set_low();
                self.delay.delay_micros(1);
            }
            for _ in 0..self.gain as u8 {
                self.pulse();
            }
            value
        });
        Ok(sign_extend_24(raw))
    }

    pub fn read_average(&mut self, samples: u32) -> Result<i32, Timeout> {
        let mut sum: i64 = 0;
        for _ in 0..samples {
            sum += self.read_raw()? as i64;
        }
        Ok((sum / samples as i64) as i32)
    }

    fn wait_ready(&self) -> Result<(), Timeout> {
        let start = Instant::now();
        while self.dt.is_high() {
            if start.elapsed() > READY_TIMEOUT {
                return Err(Timeout);
            }
        }
        Ok(())
    }

    fn pulse(&mut self) {
        self.sck.set_high();
        self.delay.delay_micros(1);
        self.sck.set_low();
        self.delay.delay_micros(1);
    }
}

fn sign_extend_24(value: u32) -> i32 {
    ((value << 8) as i32) >> 8
}
