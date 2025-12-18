// PARA RESPUESTAS DEL BACKEND AL FRONTEND
export class ImageMetadataDto {
  publicId: string;
  url: string;
  bytes: number;
  displayName: string;
  format: string;
  type: string;
  resourceType: string;
  secureUrl: string;
  signature: string;
  createAt: Date;
  updateAt: Date;
  deleteAt: Date;
  idTasker: string;
  order?: number;
}
