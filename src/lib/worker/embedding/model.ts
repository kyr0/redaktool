//import * as ONNX_WASM from "onnxruntime-web/wasm";


/*
import type { MLModel, MessageChannelMessage } from "../../../shared";
import {
  PreTrainedTokenizer,
  XLMRobertaTokenizer,
} from "./transformers/tokenizers";

import {
  env,
  pipeline,
  AutoModel,
  AutoTokenizer,
} from "./transformers/transformers";
*/
// @ts-ignore
//import getModule from "./transformers/ort-wasm-simd-threaded.jsep";

//import { embed } from "easy-embeddings";

//import { BertModel, PreTrainedModel } from "./transformers/models";
//import { mean_pooling } from "./transformers/utils/tensor";
//import { quantize_embeddings } from "@xenova/transformers/types/utils/tensor";

// https://huggingface.co/Xenova/multilingual-e5-small
export const loadEmbeddingModel = async (mlModel: MLModel) => {
  // single embedding, german embedding model
  

  /*
  const embedResult = await embed(
    ["query: Foo", "passage: Bar"],
    "local",
    {
      // https://huggingface.co/intfloat/multilingual-e5-small
      model: "Xenova/multilingual-e5-small",
      modelParams: {
        pooling: "mean",
        normalize: true, // so a single dot product of two vectors is enough to calculate a similarity score
        quantize: true, // use a quantized variant (more efficient, little less accurate)
      },
    },
    {
      importWasmModule: async (
        _mjsPathOverride: string,
        _wasmPrefixOverride: string,
        _threading: boolean,
      ) => {
        return [
          undefined,
          async (moduleArgs = {}) => {
            return await getModule(moduleArgs);
          },
        ];
      },
      modelOptions: {
        hideOnnxWarnings: false, // show warnings as errors in case ONNX runtime has a bad time
        allowRemoteModels: false, // do not download remote models from huggingface.co
        allowLocalModels: true,
        localModelPath: "/models", // loads the model from public dir subfolder "models"
        onnxProxy: false,
      },
    },
  );

  console.log("embedResult", embedResult);
  */
  /*
  console.log(
    "Loading embedding model using webgpu or wasm backend",
    ONNX_WEBGPU,
    ONNX_WASM,
    mlModel,
  );
  */
  /*
  env.backends.onnx.importWasmModule = async (
    mjsPathOverride: string,
    wasmPrefixOverride: string,
    threading: boolean,
  ) => {
    console.log(
      "importWasmModule",
      mjsPathOverride,
      wasmPrefixOverride,
      threading,
    );

    return [
      undefined,
      async (moduleArgs = {}) => {
        console.log("moduleArgs", moduleArgs);
        return await getModule(moduleArgs);
      },
    ];
  };

  env.localModelPath = "models/";
  env.allowRemoteModels = false;
  env.allowLocalModels = true;
  env.backends.onnx.wasm.wasmPaths = "/assets/";
  env.backends.onnx.wasm.proxy = false;

  const model_name = "Xenova/multilingual-e5-small";
  const tokenizer = await AutoTokenizer.from_pretrained(model_name);
  console.log("tokenizer", tokenizer);

  // store original reference
  const originalConsole = self.console;

  // override function reference with a new arrow function that does nothing
  self.console.error = () => {};
  const model = await AutoModel.from_pretrained(model_name, {
    device: "webgpu",
    dtype: "q8",
    model_file_name: "model",
  });
  // restore the original function reference, so that console.error() works just as before
  self.console.error = originalConsole.error;

  console.log("model", model);

  const batch_dict = tokenizer("hello, world", {
    padding: true,
    truncation: true,
    max_length: 512,
    //return_tensors: "pt",
  });

  console.log("batch_dict", batch_dict);

  const output = await model(batch_dict);

  console.log("output", output);
  */
  // https://developer.chrome.com/blog/new-in-webgpu-124?hl=en#service_workers_and_shared_workers_support
  // Should be fine with WebGPU
  // https://onnxruntime.ai/docs/performance/model-optimizations/ort-format-models.html#ort-format-model-loading
  /*
  const originalConsole = self.console;

  self.console.error = originalConsole.warn;

  // load tokenizer config
  const tokenizerConfig = mlModel.tokenizerConfig;
  const tokenizerJSON = JSON.parse(
    new TextDecoder("utf-8").decode(await mlModel.tokenizer.arrayBuffer()),
  );

  console.log("tokenizerConfig", tokenizerConfig);
  console.log("tokenizer", tokenizerJSON);

  // create tokenizer
  const tokenizer = new XLMRobertaTokenizer(tokenizerJSON, tokenizerConfig);

  console.log("tokenizer", tokenizer);

  // tokenize input
  const modelInputs = tokenizer(["foo", "bar"], {
    padding: true,
    truncation: true,
  });

  console.log("modelInputs", modelInputs);
  */
  /*

  // https://huggingface.co/Xenova/multilingual-e5-small in ORT format
  const mlBinaryModelBuffer = await mlModel.blob.arrayBuffer();

  const modelSession = await ONNX_WEBGPU.InferenceSession.create(
    mlBinaryModelBuffer,
    {
      executionProviders: ["webgpu"],
    },
  );
  console.log("Created model session", modelSession);

  const modelConfig = mlModel.config;
  console.log("modelConfig", modelConfig);

  const model = new BertModel(modelConfig, modelSession);
  console.log("model", model);

  const outputs = await model(modelInputs);

  let result =
    outputs.last_hidden_state ?? outputs.logits ?? outputs.token_embeddings;

  console.log("result", result);

  result = mean_pooling(result, modelInputs.attention_mask);

  console.log("meanPooling result", result);

  // normalize embeddings
  result = result.normalize(2, -1);

  console.log("normalized result", result);

  self.console.error = originalConsole.error;
  */
  // quantize embeddings
  //result = quantize_embeddings(result, "ubinary");
  // we are already in a worker thread, and require() of a Worker would lead to another import mess; so out-of-scope now
  //ONNX_WASM.env.wasm.proxy = false;
  /*
  // new feature: allows a WebAssemply module to be passed via env flags dynamically
  // we don't need the complex decision logic for BUILD_DEFS.DISABLE_TRAINING, BUILD_DEFS.DISABLE_JSEP here,
  // as we are explicitly setting the correct runtime here and can explicitly decide on it here (IoC, inversion of control)
  // In this code, please check if flags.module is set and don't call importWasmModule() in this case.
  // https://github.com/microsoft/onnxruntime/blob/83e0c6b96e77634dd648e890cead598b6e065cde/js/web/lib/wasm/wasm-factory.ts#L112
  ONNX_WASM.env.wasm.module = await WebAssembly.compile(await wasmRuntimeBlob.arrayBuffer())
  */
  //
  /*
  const sessionWasm = await ONNX_WASM.InferenceSession.create(buffer, {
    executionProviders: ["wasm"],
  });
  console.log("Loading embedding model using sessionWasm", sessionWasm);
  */
  /*
  const model = await fetch(
    // has been downloaded using "bun run download-model"
    chrome.runtime.getURL("models/model_quantized.onnx"),
  );

  const blob = await model.blob();
  */
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
