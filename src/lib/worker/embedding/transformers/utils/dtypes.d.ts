export function isFp16Supported(): Promise<boolean>;
export const DATA_TYPES: Readonly<{
    fp32: "fp32";
    fp16: "fp16";
    q8: "q8";
    int8: "int8";
    uint8: "uint8";
    q4: "q4";
    bnb4: "bnb4";
    q4f16: "q4f16";
}>;
/** @typedef {keyof typeof DATA_TYPES} DataType */
export const DEFAULT_DEVICE_DTYPE_MAPPING: Readonly<{
    cpu: "q8";
    gpu: "fp32";
    wasm: "q8";
    webgpu: "fp32";
}>;
/** @type {Record<DataType, string>} */
export const DEFAULT_DTYPE_SUFFIX_MAPPING: Record<DataType, string>;
export type DataType = keyof typeof DATA_TYPES;
//# sourceMappingURL=dtypes.d.ts.map