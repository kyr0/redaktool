export class TensorOpRegistry {
    static session_options: {};
    static get bilinear_interpolate_4d(): Promise<(inputs: any) => Promise<Tensor | Tensor[]>>;
    static get bicubic_interpolate_4d(): Promise<(inputs: any) => Promise<Tensor | Tensor[]>>;
    static get matmul(): Promise<(inputs: any) => Promise<Tensor | Tensor[]>>;
    static get stft(): Promise<(inputs: any) => Promise<Tensor | Tensor[]>>;
    static get rfft(): Promise<(inputs: any) => Promise<Tensor | Tensor[]>>;
    static get top_k(): Promise<(inputs: any) => Promise<Tensor | Tensor[]>>;
}
import { Tensor } from "../utils/tensor.js";
//# sourceMappingURL=registry.d.ts.map