import init, { greet } from "./rust_wasm_lib/pkg/rust_wasm_lib.js";

async function run() {
  await init();
  const result = greet("WebAssembly");
  console.log(result);
}

run();
