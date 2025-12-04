import { HttpException, Injectable, Logger } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/config/ErrorMannager';
import { randomUUID } from 'crypto';
import path from 'path'; //MODULO DE NODE
import { ImageMetadataDto } from 'src/shared/dtos/image-dto';
import { TTaskerImage } from 'src/types/typeTaskerImage';
import { TDataImageBase64 } from 'src/types/typeDataImageBase64';

@Injectable()
export class ProfileService {
  private readonly logger: Logger = new Logger(ProfileService.name);
  constructor(@InjectRepository(Profile) private readonly imageProfileRepo: Repository<Profile>) {}

  // METODO PARA MAPEAR PROPIEDADES NECESARIAS DE PERFIL
  public mapProfileImage = (profile: Profile | null): ImageMetadataDto | null => {
    this.logger.debug(profile);
    if (!profile) return null;
    return {
      idImage: profile.idProfile,
      systemFileName: profile.systemFileName,
      mimeType: profile.mimeType,
      originalName: profile.originalName,
      size: profile.size,
      createAt: profile.createdAt,
      updateAt: profile.updatedAt,
      deleteAt: profile.deletedAt,
      idTasker: profile.tasker.idTasker,
    } as ImageMetadataDto;
  };

  async create(
    file: Express.Multer.File | null,
    idTasker: string,
    manager?: EntityManager,
  ): Promise<Profile | null> {
    try {
      // AQUI SE DEFINE CUAL Repository/Manager USAR
      const repo: Repository<Profile> = manager
        ? manager.getRepository(Profile)
        : this.imageProfileRepo;

      if (!file) return null;

      const extension = path.extname(file.originalname);
      const systemFileName: string = `${randomUUID()}${extension}`;

      const newImageProfile: Profile = repo.create({
        size: file.size,
        mimeType: file.mimetype,
        originalName: file.originalname,
        imageBase64: file.buffer,
        systemFileName,
        tasker: { idTasker },
      });

      this.logger.debug(newImageProfile);

      const savedImageProfile: Profile = await repo.save(newImageProfile);

      return savedImageProfile; //RETORNAR ENTIDAD GUARDADA
    } catch (error) {
      const err = error as HttpException;

      this.logger.error(err.name, err.stack);
      // SI EL ERROR YA FUE MANEJADO POR ERRORMANAGER, LO RELANZO TAL CUAL
      if (err instanceof ErrorManager) throw err;

      // SI NO, CREO UN ERROR 500 GENÉRICO CON FIRMA DE ERROR
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // BUSCAR IMAGEN POR ID
  async findOneImageBase64(idTasker: string): Promise<TDataImageBase64 | null> {
    try {
      const imageProfile: Profile | null = await this.imageProfileRepo.findOne({
        where: { tasker: { idTasker } },
      });

      this.logger.debug(imageProfile);

      if (!imageProfile) return null;

      const imageProfileBase64: TDataImageBase64 = {
        mimeType: imageProfile.mimeType,
        base64: imageProfile.imageBase64.toString('base64'),
        fileName: imageProfile.systemFileName,
      };

      this.logger.debug(imageProfileBase64);

      return imageProfileBase64;
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // LEER LA IMAGEN DEL PERFIL DEL TASKER
  async getProfileByTasker(idTasker: string): Promise<TTaskerImage | null> {
    try {
      const imageProfile: Profile | null = await this.imageProfileRepo.findOne({
        where: { tasker: { idTasker } },
      });

      this.logger.debug(imageProfile);

      if (!imageProfile) return null;

      const imageProfileTasker = {
        base64: imageProfile.imageBase64,
        id: imageProfile.idProfile,
        mimeType: imageProfile.mimeType,
        originalName: imageProfile.originalName,
        systemFileName: imageProfile.systemFileName,
      } as TTaskerImage;

      this.logger.debug(imageProfileTasker);

      return imageProfileTasker;
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }
}
