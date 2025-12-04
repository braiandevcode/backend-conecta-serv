import { TTaskerImage } from "./typeTaskerImage";

// SOLO PARA IMAGEN EN BASE64
export type TDataImageBase64 = Pick<TTaskerImage, 'mimeType'> & {
    base64:string;
    fileName:string;
}