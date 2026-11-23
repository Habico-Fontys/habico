use std::env;
use std::path::PathBuf;

const C_TARGET: &str = "riscv32-unknown-none-elf";

fn main() {
    build_vl53l7cx();
    linker_be_nice();
    println!("cargo:rustc-link-arg-tests=-Tembedded-test.x");
    println!("cargo:rustc-link-arg=-Tdefmt.x");
    // make sure linkall.x is the last linker script (otherwise might cause problems with flip-link)
    println!("cargo:rustc-link-arg=-Tlinkall.x");
}

fn build_vl53l7cx() {
    let include_dirs = [
        "vl53l7cx/VL53L7CX_ULD_API/inc",
        "vl53l7cx/platform",
        "vl53l7cx/libc",
    ];
    println!("cargo:rerun-if-changed=vl53l7cx");

    cc::Build::new()
        .compiler("clang")
        .target(C_TARGET)
        .flag("-march=rv32imac")
        .flag("-mabi=ilp32")
        .flag("-ffreestanding")
        .flag("-fno-builtin")
        .includes(include_dirs)
        .file("vl53l7cx/VL53L7CX_ULD_API/src/vl53l7cx_api.c")
        .warnings(false)
        .compile("vl53l7cx");

    let bindings = bindgen::Builder::default()
        .header("vl53l7cx/wrapper.h")
        .clang_args(include_dirs.iter().map(|dir| format!("-I{dir}")))
        .clang_args([
            format!("--target={C_TARGET}"),
            "-march=rv32imac".into(),
            "-mabi=ilp32".into(),
            "-ffreestanding".into(),
        ])
        .use_core()
        .allowlist_function("vl53l7cx_.*")
        .allowlist_type("VL53L7CX_.*")
        .allowlist_var("VL53L7CX_.*")
        .layout_tests(false)
        .generate()
        .expect("failed to generate VL53L7CX bindings");

    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    bindings
        .write_to_file(out_dir.join("vl53l7cx_bindings.rs"))
        .expect("failed to write VL53L7CX bindings");
}

fn linker_be_nice() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() > 1 {
        let kind = &args[1];
        let what = &args[2];

        match kind.as_str() {
            "undefined-symbol" => match what.as_str() {
                what if what.starts_with("_defmt_") => {
                    eprintln!();
                    eprintln!(
                        "💡 `defmt` not found - make sure `defmt.x` is added as a linker script and you have included `use defmt_rtt as _;`"
                    );
                    eprintln!();
                }
                "_stack_start" => {
                    eprintln!();
                    eprintln!("💡 Is the linker script `linkall.x` missing?");
                    eprintln!();
                }
                what if what.starts_with("esp_rtos_") => {
                    eprintln!();
                    eprintln!(
                        "💡 `esp-radio` has no scheduler enabled. Make sure you have initialized `esp-rtos` or provided an external scheduler."
                    );
                    eprintln!();
                }
                "embedded_test_linker_file_not_added_to_rustflags" => {
                    eprintln!();
                    eprintln!(
                        "💡 `embedded-test` not found - make sure `embedded-test.x` is added as a linker script for tests"
                    );
                    eprintln!();
                }
                "free"
                | "malloc"
                | "calloc"
                | "get_free_internal_heap_size"
                | "malloc_internal"
                | "realloc_internal"
                | "calloc_internal"
                | "free_internal" => {
                    eprintln!();
                    eprintln!(
                        "💡 Did you forget the `esp-alloc` dependency or didn't enable the `compat` feature on it?"
                    );
                    eprintln!();
                }
                _ => (),
            },
            // we don't have anything helpful for "missing-lib" yet
            _ => {
                std::process::exit(1);
            }
        }

        std::process::exit(0);
    }

    println!(
        "cargo:rustc-link-arg=--error-handling-script={}",
        std::env::current_exe().unwrap().display()
    );
}
