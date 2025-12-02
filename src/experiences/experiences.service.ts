import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Experience } from './entities/experience.entity';
import { EntityManager, Repository } from 'typeorm';
import path from 'path';
import { randomUUID } from 'crypto';
import { ErrorManager } from 'src/config/ErrorMannager';
import { TTaskerImage } from 'src/types/typeTaskerImage';
import { ImageMetadataDto } from 'src/shared/dtos/image-dto';

@Injectable()
export class ExperiencesService {
  constructor(@InjectRepository(Experience) private readonly imageExperienceRepo: Repository<Experience>) {}

  // METODO PARA MAPEAR PROPIEDADES NECESARIAS DE CADA IMAGEN DE EXPERIENCIA
  public mapExperienceImages = (experiences: Experience[]): ImageMetadataDto[] => {
    return experiences.map(
      (exp): ImageMetadataDto => ({
        idImage: exp.idExperience,
        systemFileName: exp.systemFileName,
        mimeType: exp.mimeType,
        originalName: exp.originalName,
        size: exp.size,
        createAt: exp.createdAt,
        updateAt: exp.updatedAt,
        deleteAt: exp.deletedAt,
        order: exp.order,
        idTasker: exp.tasker.idTasker,
      }),
    );
  };

  // CREAR IMAGENES
  async create(
    files: Express.Multer.File[],
    idTasker: string,
    manager?: EntityManager,
  ): Promise<Experience[]> {
    const repo: Repository<Experience> = manager
      ? manager.getRepository(Experience)
      : this.imageExperienceRepo;

    // OBTENER TODOS LOS ORDERS EXISTENTES
    const existingImages = await repo.find({
      where: { tasker: { idTasker } },
      select: ['order'], // ==> TRAER SOLO LA COLUMNA ORDER (OPTIMIZACION)
    });

    // DETERMINAR EL ORDEN MAS ALTO
    // CREA ARRAY DE TODOS LOS NUMEROS DE ORDER [1, 2, 3, 1]
    const orders: number[] = existingImages.map(img => img.order);

    // CALCULAMOS EL ORDEN MAS ALTO
    const maxOrder = orders.length > 0 ? Math.max(...orders) : 0;

    // DEFINIMOS NUEVO ORDEN DEL INICIO
    // SI EL MAXIMO ES 3, currentOrder DEBERIA SER 4.SI ES 0 ENTONCES 1.
    let currentOrder = maxOrder + 1;

    // SI ENCONTRO UNA ULTIMA IMAGEN EN EL USUARIO TASKER SUMAR UNO SINO ES EL ORDEN PRIMERO
    const savedExperiences: Experience[] = []; //ACUMULADOR ARREGLO DE EXPERIENCIAS VACIO

    for (const file of files) {
      const extension = path.extname(file.originalname);
      const systemFileName: string = `${randomUUID()}${extension}`;

      // GUARDAR EL BINARIO EN LA DB
      const newExperience: Experience = repo.create({
        originalName: file.originalname,
        size: file.size,
        order: currentOrder,
        mimeType: file.mimetype,
        tasker: { idTasker },
        systemFileName,
        imageBase64: file.buffer, // BUFFER LIMPIO
      });

      savedExperiences.push(newExperience);

      await repo.save(newExperience);
      currentOrder++; // => INCREMENTA A UNO
    }

    return savedExperiences; // ==> RETORNAR
  }

  // BUSCAR IMAGENES POR ID
  async findAllById(idTasker: string): Promise<{ mimeType: string; base64: string }[] | []> {
    try {
      const imagesExp: Experience[] = await this.imageExperienceRepo.find({
        where: { tasker: { idTasker } },
      });

      // SI NO HAY LONGITUD
      if (imagesExp.length === 0) return [];

      // SINO MAPEAR
      return imagesExp.map(img => ({
        mimeType: img.mimeType,
        base64: img.imageBase64.toString('base64'),
      }));

    } catch (error) {
      const err = error as HttpException;
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // LEER TODAS LAS IMAGENES DE UN TASKER
  async getExperiencesByTasker(idTasker: string): Promise<TTaskerImage[]> {
    try {
      const imagesExp: Experience[] = await this.imageExperienceRepo.find({
        where: { tasker: { idTasker } },
      });

      // MAPEAR TODAS LAS QUE TENGA EL TASKER EN PARTICULAR
      const images: TTaskerImage[] = imagesExp.map(image => ({
        base64: image.imageBase64,
        id: image.idExperience,
        mimeType: image.mimeType,
        originalName: image.originalName,
        systemFileName: image.systemFileName,
      }));

      return images; //RETORNAR
    } catch (error) {
      const err = error as HttpException;
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // UNA IMAGEN DE EXPERIENCIA POR ID
  async getExperienceImageById(idExperience: string): Promise<TTaskerImage | null> {
    try {
      const imageExp: Experience | null = await this.imageExperienceRepo.findOne({
        where: { idExperience },
      });

      if (!imageExp) return null;

      return {
        base64: imageExp?.imageBase64,
        id: imageExp.idExperience,
        mimeType: imageExp.mimeType,
        originalName: imageExp.originalName,
        systemFileName: imageExp.systemFileName,
      } as TTaskerImage;

    } catch (error) {
      const err = error as HttpException;
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }
}
