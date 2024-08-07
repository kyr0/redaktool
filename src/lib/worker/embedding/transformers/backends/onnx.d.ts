/**
 * Map a device to the execution providers to use for the given device.
 * @param {import("../utils/devices.js").DeviceType} [device=null] (Optional) The device to run the inference on.
 * @returns {import("../utils/devices.js").DeviceType[]} The execution providers to use for the given device.
 */
export function deviceToExecutionProviders(device?: import("../utils/devices.js").DeviceType): import("../utils/devices.js").DeviceType[];
/**
 * Create an ONNX inference session.
 * @param {Uint8Array} buffer The ONNX model buffer.
 * @param {Object} session_options ONNX inference session options.
 * @returns {Promise<import('onnxruntime-common').InferenceSession>} The ONNX inference session.
 */
export function createInferenceSession(buffer: Uint8Array, session_options: any): Promise<import('onnxruntime-common').InferenceSession>;
/**
 * Check if an object is an ONNX tensor.
 * @param {any} x The object to check
 * @returns {boolean} Whether the object is an ONNX tensor.
 */
export function isONNXTensor(x: any): boolean;
/**
 * Check if ONNX's WASM backend is being proxied.
 * @returns {boolean} Whether ONNX's WASM backend is being proxied.
 */
export function isONNXProxy(): boolean;
export { Tensor } from "onnxruntime-common";
//# sourceMappingURL=onnx.d.ts.map