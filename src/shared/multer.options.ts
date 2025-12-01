import { Request } from 'express';
import { HttpException } from '@nestjs/common';
import { ErrorManager } from '../config/ErrorMannager';
import { memoryStorage, Options } from 'multer';
import { ESeparatorsMsgErrors } from 'src/common/enums/enumSeparatorMsgErrors';

/*
  ESTA FUNCION ES UN MIDDLEWARE DE VALIDACION QUE MULTER EJECUTA,
   INDIVIDUALMENTE PARA CADA ARCHIVO QUE LLEGA EN LA PETICIÓN.
*/
export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: HttpException | null, acceptFile: boolean) => void,
) => {
  // TU LÓGICA DE VALIDACIÓN DE TIPO DE ARCHIVO AHORA ESTÁ AQUÍ
  if (!file.mimetype.match(/(image\/jpg|jpeg|png|webp)$/)) {
    return callback(
      ErrorManager.createSignatureError(`UNSUPPORTED_MEDIA_TYPE${ESeparatorsMsgErrors.SEPARATOR}Tipo de archivo no soportado.`),
      false,
    );
  }
  callback(null, true);
};

// OBJETO QUE CONTIENE TODAS LAS REGLAS DE MULTER
export const multerOptions:Options= {
  storage: memoryStorage(),
  // LIMITACIONES DE TAMAÑO: OBJETO DONDE SE ESTABLECEN LIMITES NUMERICOS.
  limits: {
    // 5 * 1024 * 1024 bytes = 5MB
    fileSize: 5 * 1024 * 1024, //ESTABLECE EL TAMAÑO MÁXIMO PERMITIDO PARA CADA ARCHIVO EN BYTES
  },
  fileFilter: imageFileFilter, //LE DICE A MULTER QUE EJECUTE LA FUNCION imageFileFilter PARA APLICAR LAS VALIDACIONES PERSONALIZADAS
};
