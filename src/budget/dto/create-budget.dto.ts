import { IsIn, IsNotEmpty, IsNumber, Max } from 'class-validator';

export class CreateBudgetDto {
  @IsNumber({}, { message: 'El valor del monto debe ser numerico' })
  @Max(100000000, { message: 'El monto ingresado excede el máximo' })
  amountBudge: number; 

  @IsNotEmpty()
  @IsIn(['yes', 'no'], { message: 'budgeSelected debe ser "yes" o "no"' })
  budgeSelected: 'yes' | 'no';

  @IsNotEmpty() 
  @IsIn(['yes', 'no'], { message: 'reinsert debe ser "yes" o "no"' })
  reinsertSelected: 'yes' | 'no';
}
