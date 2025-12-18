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
  budget: TBudgetData | null;
  description: string | null;
  idProfile: string;
  idExperiences: string[];
  publicIdProfile: string;
  publicIdExperiences: string[];
  profileImageUrl: string | null;
  experienceImagesUrl: string[];
};
