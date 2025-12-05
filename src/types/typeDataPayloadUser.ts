import { Budget } from 'src/budget/entities/budget.entity';
import { TBudgetData } from './typeBudgetData';

export type TDataPayloadUser = {
  sub: string;
  userName: string;
  fullName: string;
  email: string;

  roles: {
    idRole: string;
    nameRole: string;
  }[];

  isTasker: boolean;

  days: string[];
  hours: string[];
  services: string[];
  worksArea: string[];
  category: string | null;
  budget:TBudgetData| null;
  description: string | null;

  profileImageUrl: string | null;
  experienceImagesUrl: string[];
};
