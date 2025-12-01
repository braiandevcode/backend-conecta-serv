import { HttpException, Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/config/ErrorMannager';
import { randomUUID } from 'crypto';
import path from 'path'; //MODULO DE NODE

@Injectable()
export class ProfileService {
  constructor(@InjectRepository(Profile) private readonly imageProfileRepo: Repository<Profile>) {}
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

      const savedImageProfile: Profile = await repo.save(newImageProfile);

      return savedImageProfile; //RETORNAR ENTIDAD GUARDADA
    } catch (error) {
      const err = error as HttpException;
      // SI EL ERROR YA FUE MANEJADO POR ERRORMANAGER, LO RELANZO TAL CUAL
      if (err instanceof ErrorManager) throw err;

      // SI NO, CREO UN ERROR 500 GENÉRICO CON FIRMA DE ERROR
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // BUSCAR IMAGEN POR ID
  async findOne(idTasker: string): Promise<{ mimeType: string; base64: string } | null> {
    try {
      const imageProfile: Profile | null = await this.imageProfileRepo.findOne({
        where: { tasker: { idTasker } },
      });

      if (!imageProfile) return null;

      return {
        mimeType: imageProfile.mimeType,
        base64: imageProfile.imageBase64.toString('base64'),
      };
    } catch (error) {
      const err = error as HttpException;
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  findAll() {
    return `This action returns all profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
