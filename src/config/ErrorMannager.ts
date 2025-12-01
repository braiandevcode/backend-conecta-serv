import { HttpException, HttpStatus } from '@nestjs/common';

// OBJETO CONFIGURATIVO PARA ERRORES
export class ErrorManager extends HttpException {
  // CONSTRUCTOR ==> type ES DEL TIPO DE CADA CLAVE QUE VIENE DEL ENUM HttpStatus
  constructor({ type, message,
  }: { type: keyof typeof HttpStatus; message: string; }) {
    super(`${type}' :: '${message}`, HttpStatus[type] as number);
  }

  // FIRMA
  public static createSignatureError(message: string):HttpException {
    const typeName: string = message.split(' :: ')[0]; //==> POSICION DE INDICE 0 DONDE ESTA EL VALOR DEL TIPO DE ERROR
    
    const status:number = HttpStatus[typeName] 
        ? (HttpStatus[typeName] as number) 
        : HttpStatus.INTERNAL_SERVER_ERROR; 

    throw new HttpException(message, status);
  }
}
