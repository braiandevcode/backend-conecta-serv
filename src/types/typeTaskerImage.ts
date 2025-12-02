export interface TTaskerImage {
  id: string;             // ID DE LA IMAGEN
  base64: Buffer;         // CONTENIDO BASE 64
  mimeType: string;       // TIPIPO DE MIME
  originalName?: string;   
  systemFileName?: string; 
}
