import * as ONNX from "onnxruntime-web";
import * as ONNX_WEBGPU from "onnxruntime-web/webgpu";

const { env: onnx_env } = ONNX;
const VERSION = "2.17.2";

export const env = {
  backends: {
    onnx: onnx_env,
    tfjs: {},
  },
  __dirname,
  version: VERSION,
  allowRemoteModels: false,
  remoteHost: "https://huggingface.co/",
  remotePathTemplate: "{model}/resolve/{revision}/",
  allowLocalModels: true,
  localModelPath: "./models",
  useFS: false,
  useBrowserCache: true,
  useFSCache: false,
  cacheDir: undefined,
  useCustomCache: false,
  customCache: null,
};

// https://huggingface.co/Xenova/multilingual-e5-small
export const loadEmbeddingModel = async () => {
  console.log("Loading embedding model", ONNX, "webgpu", ONNX_WEBGPU);

  onnx_env.wasm.wasmPaths = "./dist";

  // TODO: model must be transferred here!
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects

  /**
   * https://groups.google.com/a/chromium.org/g/chromium-extensions/c/HbRX7r4KZt0?pli=1
   *
   * https://groups.google.com/a/chromium.org/g/chromium-extensions/c/UyNHEHQKlJA/m/it_eC58DAwAJ
   *
   * https://groups.google.com/a/chromium.org/g/chromium-extensions/c/IPJSfjNSgh8/m/Dh35-tZPAgAJ
   */

  const model = await fetch(
    "file://./models/Xenova/multilingual-e5-small/onnx/model_quantized.with_runtime_opt.ort",
  );

  const blob = await model.blob();
  const buffer = await blob.arrayBuffer();

  // https://onnxruntime.ai/docs/performance/model-optimizations/ort-format-models.html#ort-format-model-loading
  // TODO: Load model
  const session = await ONNX_WEBGPU.InferenceSession.create(buffer);

  /*
  const model = await fetch(
    // has been downloaded using "bun run download-model"
    chrome.runtime.getURL("models/model_quantized.onnx"),
  );

  const blob = await model.blob();
  */

  console.log("Loading embedding model", session);
  /*
  // Allocate pipeline
  const pipe = await pipeline(
    "feature-extraction",
    "Xenova/multilingual-e5-small",
    {
      quantized: true,
      cache_dir: "models",
    },
  );
  console.log("Model loaded", pipe);
  */
};
