import { HttpException, Injectable, Logger } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/config/ErrorMannager';
import { TTaskerImage } from 'src/types/typeTaskerImage';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProfileService {
  private readonly logger: Logger = new Logger(ProfileService.name);
  constructor(
    @InjectRepository(Profile) private readonly imageProfileRepo: Repository<Profile>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  // CREAR NUEVA IMAGEN DEL PERFIL DE UN TASKER
  async create(
    idTasker: string,
    imageDto: CreateProfileDto,
    manager?: EntityManager,
  ): Promise<Profile | null> {
    try {
      // AQUI SE DEFINE CUAL Repository/Manager USAR
      const repo: Repository<Profile> = manager
        ? manager.getRepository(Profile)
        : this.imageProfileRepo;

      const newImageProfile: Profile = repo.create({ ...imageDto, tasker: { idTasker } });

      this.logger.debug('NUEVA IMAGEN DE PERFIL: ', newImageProfile);

      const savedImageProfile: Profile = await repo.save(newImageProfile);

      this.logger.debug('NUEVALO QUE SE ESTA RETORNANDO: ', newImageProfile);

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
  async findOneImageProfile(idTasker: string): Promise<TTaskerImage | null> {
    try {
      const imageProfile: Profile | null = await this.imageProfileRepo.findOne({
        where: { tasker: { idTasker } },
      });

      this.logger.debug(imageProfile);

      if (!imageProfile) return null;

      // RETORNO DATOS NECESARIOS AL FRONTEND
      return {
        publicId: imageProfile.publicId,
        mimeType: imageProfile.type,
        url: imageProfile.secureUrl,
      } as TTaskerImage;
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

      const imageProfileTasker: TTaskerImage = {
        publicId: imageProfile.publicId,
        mimeType: imageProfile.type,
        url: imageProfile.secureUrl,
      };

      this.logger.debug(imageProfileTasker);

      return imageProfileTasker;
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // BORRAR SOLO IMAGEN PREVIA ANTES DE REGISTRO
  async deleteAvatarPrev(publicId: string): Promise<void> {
    return await this.cloudinaryService.delete(publicId);
  }
}
