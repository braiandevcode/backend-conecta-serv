import { HttpException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { EntityManager, Repository } from 'typeorm';
import { ErrorManager } from 'src/config/ErrorMannager';
import { ECategory } from 'src/common/enums/enumCategory';
import { SERVICES_BY_CATEGORY } from 'src/common/enums/enum.utils';
import { ESeparatorsMsgErrors } from 'src/common/enums/enumSeparatorMsgErrors';


@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}
  
  create(createCategoryDto: CreateCategoryDto) {
    return 'This action adds a new category';
  }

  async findOrCreate(createCategoryDto:CreateCategoryDto, manager?: EntityManager): Promise<Category> {
    try {
      // AQUI SE DEFINE CUAL Repository/Manager USAR
      const repo: Repository<Category> = manager ? manager.getRepository(Category) : this.categoryRepository;

      //  ESTO PERMITE QUE SI SE AGREGAN MAS CATEGORIAS YA ESTA FLEXIBLE Y PREPARADO A NO DUPLICAR EN LA TABLA
      let categoryEntity = await repo.findOne({
        where: { categoryName: createCategoryDto.category },
      });

      // PREGUNTAR SI LA CATEGORIA AGREGADA NO EXISTE, SI NO EXISTE ==> CREAMOS Y GUARDAMOS EN ENTIDAD
      if (!categoryEntity) {
        categoryEntity = repo.create({ categoryName: createCategoryDto.category });

        const categoryName:ECategory = categoryEntity.categoryName;

        // VALIDAR QUE LA CATEGORIA SEA UNA PERMITIDA
        if (!(categoryName in SERVICES_BY_CATEGORY)) {
          throw ErrorManager.createSignatureError(`FORBIDDEN${ESeparatorsMsgErrors.SEPARATOR}La categoria establecida no es valida.`);
        }

        categoryEntity = await repo.save(categoryEntity);
      }
      return categoryEntity;
    } catch (error) {
      const err = error as HttpException;

      if (err instanceof ErrorManager) throw err;

      // SI NO, CREO UN ERROR 500 GENERICO CON FIRMA DE ERROR
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  findAll() {
    return `This action returns all category`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
