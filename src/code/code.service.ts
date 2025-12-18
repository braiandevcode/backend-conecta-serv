import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { UpdateCodeDto } from './dto/update-code.dto';
import { TVerifyCode } from 'src/types/typeSendVerifyCode';
import { ErrorManager } from 'src/config/ErrorMannager';
import { InjectRepository } from '@nestjs/typeorm';
import { Code } from './entities/code.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RequestCodeDto } from './dto/request-code-dto';
import { iPayloadTokenVerifyEmail } from 'src/code/interface/iPyloadTokenVerifyEmail';
import { iSendResendEmail } from 'src/code/interface/iSendResendEmail';
import { VerifyCodeDto } from './dto/verify-code-dto';
import { iMessageResponseStatus } from 'src/code/interface/iMessagesResponseStatus';
import { iMessageStausToken } from 'src/code/interface/iMessageStatusToken';
import { ConfigResendService } from 'src/configResend/config-resend.service';
import { CreateEmailResponse, Resend } from 'resend';
import { UpdateResult } from 'typeorm/browser';
import { User } from 'src/user/entities/user.entity';
import { join } from 'path'; //MODULO PATH DE NODE
import { readFileSync } from 'fs'; //MODULO FS DE NODE
import { ETokenType } from 'src/common/enums/enumTokenType';
import { EStatusVerifyEmail } from 'src/common/enums/enumStatusVerifyEmail';

@Injectable()
export class CodeService {
  private readonly resend: Resend;

  constructor(
    @InjectRepository(Code) private readonly codeRepository: Repository<Code>,
    private readonly jwtService: JwtService,
    private readonly emailCredentialsService: ConfigResendService,
    private readonly userService: UserService,
  ) {
    // INICIALIZAR EL CLIENTE RESEND CON LA API KEY
    const { apiKey } = this.emailCredentialsService.getClientInit();
    this.resend = new Resend(apiKey); //INSTANCIA DE RESEND
  }

  //METODO PRIVADO QUE RETORNA OBJETO DE CONFIGURACION PARA ENVIO DEL TEMPLATE AL EMAIL DEL USUARIO
  private templateParamsEmailjs = ({ to_email, verification_code }: TVerifyCode): TVerifyCode => ({
    to_email, // ==> CORREO DE DESTINO
    verification_code, //==> CODIGO GENERADO A LA PLANTILLA
  });

  // METODO PRIVADO PARA GENERAR EL RANDOM
  private generateRandomNumber() {
    // GENERAR UN NUMERO ALEATORIO ENTRE 100000 y 999999
    // PISO DE 100000
    // DEL RANGO DESDE 0 A CASI 1(EXCLUIDO) MULTIMPLICADO POR 900000 ==> Y SUMANDO 100000(DESPLAZAMIENTO PARA EL INICIO)
    // FLOOR REDONDEA HACIA EL "PISO" NUMERO MAS PEQUEÑO ==> CON ROUND() PODRIA OBTENER 1.000.000 LO CUAL GENERARIA UN DIGITO MAS
    return Math.floor(100000 + Math.random() * 900000);
  }

  // METODO PRIVADO PARA GENERAR EL TOKEN JWT DE VERIFICACION
  private generateVerificationToken(email: string): string {
    const payload: iPayloadTokenVerifyEmail = {
      email: email,
      type: ETokenType.EMAIL_VERIFY,
    };
    return this.jwtService.sign(payload);
  }

  // METODO PARA CREAR PLANTILLA DE RESEND
  private getMailServiceHtml(code:string):string{
    // const filePath:string = join(__dirname, "../templates/code_verify.html");
    const filePath = join(process.cwd(), 'dist', 'templates', 'code_verify.html');
    let html:string = readFileSync(filePath, 'utf-8');
    html = html.replace('{{CODE}}', code);
    return html;
  }

  // ENVIO DE CODIGO MEDIANTE SERVICIO RESEND
  private async sendEmailService({ email, code }: iSendResendEmail): Promise<CreateEmailResponse> {
    try {
      // USO METODO CONFIGURATIVO
      const templateParams: TVerifyCode = this.templateParamsEmailjs({
        to_email: email,
        verification_code: code.toString(),
      });

      // HTML SIMPLE PARA EL EMAIL USANDO LOS PARAMS DE LA "PLANTILLA" 
      const html:string = this.getMailServiceHtml(templateParams.verification_code);

      // ENVIO Y RESPUESTA DEL SERVICIO RESEND
      const responseService:CreateEmailResponse = await this.resend.emails.send({
        from: 'ConectaServ <onboarding@resend.dev>', // SOLO PARA DESARROLLO DEJA ENVIAR A PROPIO EMAIL. CAMBIAR EN PRODUCCIÓN
        to: email, //EN DESARROLLO SOLO A EMAIL DE CUENTA RESEND
        subject: 'Código de verificación',
        html,
      });

      // VALIDAR RESPUESTA BASICA
      if (!responseService || !responseService.data || !responseService.data.id) {
        throw ErrorManager.createSignatureError(`INTERNAL_SERVER_ERROR :: El servicio no pudo concretar el envio, por un problema desconocido`);
      }
      return responseService;
    } catch (error) {
      // CAPTURAMOS CUALQUIER ERROR NO CONTROLADO
      const err = error as HttpException;
      // SI EL ERROR YA FUE MANEJADO POR ERRORMANAGER, LO RELANZO TAL CUAL
      if (err instanceof ErrorManager) throw err;
      // SI NO, CREO UN ERROR 500 GENERICO CON FIRMA DE ERROR
      throw ErrorManager.createSignatureError(err?.message ?? 'Error desconocido al enviar email');
    }
  }

  //SOLICITAR SERVICIO RESEND Y GUARDAR DATOS EN DB
  async requestCode(requestCodeDto: RequestCodeDto): Promise<iMessageStausToken> {
    const { emailCode } = requestCodeDto; //DESESTRUCTURO EL CUERPO
    let code: number; // AUX PARA ALMACENAR EN MOMORIA NUMERO DE CODIGO GENERADO
    let token: string; // AUX PARA ALMACENAR EN MOMORIA EL TOKEN GENERADO
    try {
      // LLAMAR AL SERVICIO QUE SE ENCARGA DE LA CONSULTA A LA TABLA USUARIOS Y FILTRA POR EL EMAIL QUE SE LE PASA
      const resultUserService: User | null = await this.userService.getUserEmail({ email: emailCode});

      // SI YA EXISTE 
      if (resultUserService) {        
        throw ErrorManager.createSignatureError('CONFLICT :: El email ya existe')
      }

      // SI NO EXISTE, PROCEDEMOS A GENERAR Y ALMACENAR
      // GENERAR CODIGO Y TOKEN
      code = this.generateRandomNumber(); // GENERAR NUMERO ALEATORIO
      token = this.generateVerificationToken(emailCode); // GENERAR EL TOKEN JWT

      // ENVIAR CON SERVICIO
      const resendResponse: CreateEmailResponse =  await this.sendEmailService({ email:emailCode, code });
      // SI HAY ERROR DEL SERVICIO NO ALMACENAR EN DB
      if(resendResponse.error?.statusCode === 404){
        throw ErrorManager.createSignatureError(`NOT_FOUND :: El proceso no se pudo concretar, correo inexistente`);
      }

      let expiresAt:Date | null = null;

      if(resendResponse.headers){
        // CALCULAR EXPIRACION
        const sendTime = new Date(resendResponse.headers.date); // MOMENTO REAL DEL ENVIO POR LIBRERIA RESEND
        expiresAt = new Date(sendTime.getTime() + 5 * 60 * 1000); // 5 MINUTOS DESDE EL ENVIO REAL
      }

      // SI NO VIENE FECHA ERROR
      if(expiresAt === null){
        throw ErrorManager.createSignatureError(`INTERNAL_SERVER_ERROR :: El servicio no pudo concretar el envio, por un problema desconocido`);
      }

      const newValues = {
        code: code.toString(), // CONVERSIÓN A STRING
        status: EStatusVerifyEmail.PENDING, // ESTADO INICIAL
        expiresAt: expiresAt, // SE GUARDA EL TIEMPO DE EXPIRACIÓN
      };

      // ACTUALIZAR REGISTRO DE CODIGO
      const updateResult: UpdateResult = await this.codeRepository.update(
        { toEmail: emailCode }, // CRITERIO, BUSCO POR EMAIL QUE ES UNIQUE
        newValues, // NUEVOS VALORES A REEMPLAZAR
      );

      // SI NO SE ACTUALIZO ES EL PRIMER REGISTRO ENTONCES INSERTAR
      if (updateResult.affected === 0) {
        // GUARDAR NUEVO REGISTRO EN LA DB
        const newCodeRecordCode = this.codeRepository.create({
          toEmail: emailCode,
          ...newValues,
        });
        // GUARDAR EN DB DATOS DEL CODIGO
        await this.codeRepository.save(newCodeRecordCode);
      }

      return { token, success:true, expiresAt:expiresAt }; // RETORNAR DATOS QUE EL FRONTEND NECESITARA
    } catch (error){
      // CAPTURAMOS CUALQUIER ERROR NO CONTROLADO
      const err = error as HttpException;

      // SI EL ERROR YA FUE MANEJADO POR ERRORMANAGER, LO RELANZO TAL CUAL
      if (err instanceof ErrorManager) throw err;
      // SI NO, CREO UN ERROR 500 GENERICO CON FIRMA DE ERROR
      throw ErrorManager.createSignatureError(err?.message ?? 'Error desconocido');
    }
  }

  // METODO PARA VERIFICAR CODIGO
  async verifyCode(verifyCodeDto: VerifyCodeDto): Promise<iMessageResponseStatus> {
    const { email, code, token } = verifyCodeDto; // DTO DE VERIFICACION

    // VERIFICAR EL JWT VERIFICAR FIRMA Y EXPIRACION DEL TOKEN
    try {
      const payload: iPayloadTokenVerifyEmail = this.jwtService.verify(token); // JWT VERIFICA FIRMA QUE VIENE DEL FRONTEND
      // SI EL EMAIL DEL TOKEN NO COINCIDE CON EL EMAIL DEL CUERPO
      if (payload.email !== email || payload.type !== ETokenType.EMAIL_VERIFY) {
        // EL TOKEN NO CORRESPONDE A ESTE EMAIL/FLUJO
        throw ErrorManager.createSignatureError(`UNAUTHORIZED :: El token no corresponde al email o al flujo de verificación.`);
      }
    } catch (error) {
      // SI jwtService.verify FALLA LANZA EXCEPCIÓN.
      throw ErrorManager.createSignatureError(`UNAUTHORIZED :: Token inválido o expirado.`);
    }

    // VERIFICAR EN LA DB
    const verificationRecord: Code | null = await this.codeRepository.findOne({
      where: {
        toEmail: email,
        code: code,
        status: EStatusVerifyEmail.PENDING,
      },
    });

    // SI NO EXISTE EN LA BUSQUEDA
    if (!verificationRecord) {
      // EL CODIGO NO COINCIDE, YA FUE USADO, O NO EXISTE
      ErrorManager.createSignatureError(`BAD_REQUEST :: Código de verificación incorrecto.`);
    }

    // ACTUALIZAR ESTADO (MARCAR COMO USADO)
    await this.codeRepository.update(
      { toEmail: email, code: code }, // FILTRO POR EL CODIGO Y EMAIL
      { status: EStatusVerifyEmail.USED }, // CAMBIAR EL ESTADO A USADO
    );

    // ENVIAR BOOLEAN DE EXITO
    return { message: 'Verificado con exito', success: true, status: HttpStatus.OK } as iMessageResponseStatus;
  }


  // LIMPIAR TODOS LOS TOKENS DE VERIFICACION QUE ESTEN EN USO Y EXPIRADOS
  // LIMPIAR TOKENS EXPIRADOS (USAR EN JOB/Cron)
  async removeExpiredAndUsed() {
    try {
      const now:Date = new Date(); //INSTANCIAR EL TIEMPO ACTUAL
      return this.codeRepository.createQueryBuilder()
      .delete() //BORRAR TODO
      .from(Code) //DE LA ENTIDAD "Code"
      .where('expires_at <= :now', { now }) //DONDE SE CUMPLA CON EL CRITERIO EN QUE EL TIEMPO ACTUAL SEA MENOR O IGUAL AL DE EXPIRACION, ES DECIR YA PASO
      .andWhere('status = :status', { status: 'USED' })
      .execute(); //EJECUTA EL DELETE
    } catch (error) {
      const err = error as HttpException;
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

}
