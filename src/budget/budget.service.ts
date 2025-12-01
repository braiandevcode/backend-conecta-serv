import { HttpException, Injectable } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget } from './entities/budget.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ErrorManager } from 'src/config/ErrorMannager';
import { ECategory } from 'src/common/enums/enumCategory';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
  ) {}
  async create(
    createBudgetDto: CreateBudgetDto,
    category: ECategory,
    manager?: EntityManager,
  ): Promise<Budget | null> {
    const { amountBudge, budgeSelected, reinsertSelected } = createBudgetDto;
    try {
      // AQUI SE DEFINE CUAL Repository/Manager USAR
      const repo: Repository<Budget> = manager ? manager.getRepository(Budget) : this.budgetRepository;
      
      let budgeTasker: Budget | null = null;

      // SI CATEGORIA ES REPARACION Y MANTENIMIENTO
      if (category === ECategory.REPAIR) {
        // SI VIENEN DATOS DE PRESUPUESTO
        // CREAR
        budgeTasker = repo.create({
          amount: amountBudge,
          reinsertSelected,
          budgeSelected,
        });
      }

      return budgeTasker;
    } catch (error) {
      const err = error as HttpException;
      // SI EL ERROR YA FUE MANEJADO POR ERRORMANAGER, LO RELANZO TAL CUAL
      if (err instanceof ErrorManager) throw err;

      // SI NO, CREO UN ERROR 500 GENÉRICO CON FIRMA DE ERROR
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  findAll() {
    return `This action returns all budget`;
  }

  findOne(id: number) {
    return `This action returns a #${id} budget`;
  }

  update(id: number, updateBudgetDto: UpdateBudgetDto) {
    return `This action updates a #${id} budget`;
  }

  remove(id: number) {
    return `This action removes a #${id} budget`;
  }
}
