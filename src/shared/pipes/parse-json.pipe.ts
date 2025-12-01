import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ErrorManager } from 'src/config/ErrorMannager';

// PARA PARSEO NECESARIO EN PRUEBAS
@Injectable()
export class ParseJsonPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        ErrorManager.createSignatureError('BAD_REQUEST :: El campo de datos no es un JSON válido.');
      }
    }
    return value; 
  }
}