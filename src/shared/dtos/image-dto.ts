export class ImageMetadataDto {
    idImage:string;
    systemFileName: string;
    mimeType: string;
    originalName: string;
    size:number;
    createAt:Date;
    updateAt:Date;
    deleteAt:Date;
    idTasker:string;
    order?: number;
}