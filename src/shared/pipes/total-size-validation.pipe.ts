import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class TotalSizeValidationPipe implements PipeTransform {
  private readonly MAX_TOTAL_SIZE_BYTES = 50 * 1024 * 1024; // 50MB TOTAL

  // TRASNFORMAR
  transform(files: Array<Express.Multer.File>) {
    // SI NO HAY ARCHIVOS 
    if (!files || files.length === 0) return files; 

    // CALCULO TOTAL DE TAMAÑO DE TODO LOS ARCHIVOS
    const totalSize:number = files.reduce((sum, file) => sum + file.size, 0);

    // SI EL TAMAÑO ES SUPERIOR AL TOTAL
    if (totalSize > this.MAX_TOTAL_SIZE_BYTES) {
      // LANZAR ERROR
      throw new BadRequestException(
        `PAYLOAD_TOO_LARGE :: El tamaño total para todas las imagenes excede el límite permitido de 50MB.`,
      );
    }
    return files; // PASAN TODAS LAS VALIDACIONES
  }
}