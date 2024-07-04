import { pipeline } from "@xenova/transformers";

import { $ } from "bun"

// make sure, onnxruntime is installed
await $`pip install -r requirements.txt`

// download the model (ONNX, quantized)
try {
  await pipeline(
    "feature-extraction",
    "Xenova/multilingual-e5-small",
    {
      quantized: true,
      cache_dir: "models"
    },
  );
} catch (e) {}

const file = Bun.file("./models/Xenova/multilingual-e5-small/onnx/model_quantized.onnx");

if (file) {
  console.log("Model loaded.");
}

// convert .onnx files into .ort format
await $`python -m onnxruntime.tools.convert_onnx_models_to_ort ./models/Xenova/multilingual-e5-small`

process.exit(0);