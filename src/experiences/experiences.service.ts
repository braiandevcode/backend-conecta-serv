import { Injectable } from '@nestjs/common';
// import { UpdateExperienceDto } from './dto/update-experience.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Experience } from './entities/experience.entity';
import { EntityManager, Repository } from 'typeorm';
import path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectRepository(Experience)
    private readonly imageExperienceRepo: Repository<Experience>,
  ) {}

  async create(
    files: Express.Multer.File[],
    idTasker: string,
    manager?: EntityManager,
  ): Promise<Experience[]> {
    const repo: Repository<Experience> = manager ? manager.getRepository(Experience) : this.imageExperienceRepo;

    // OBTENER TODOS LOS ORDERS EXISTENTES
    const existingImages = await repo.find({
      where: { tasker: { idTasker } },
      select: ['order'], // ==> TRAER SOLO LA COLUMNA ORDER (OPTIMIZACION)
    });

    // DETERMINAR EL ORDEN MAS ALTO
    // CREA ARRAY DE TODOS LOS NUMEROS DE ORDER [1, 2, 3, 1]
    const orders: number[] = existingImages.map((img) => img.order);

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
}
