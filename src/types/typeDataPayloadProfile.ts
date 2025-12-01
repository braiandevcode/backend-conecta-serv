type TBudgetData = {
  amountBudget: number;
  budgeSelected: string;
  reinsert: string;
};

export type TDataPayloadUser = {
  sub: string;
  userName: string;
  fullName: string;
  email: string;
  roles: string[];
  isTasker: boolean;

  days: string[] | null;
  hours: string[] | null;
  services: string[] | null;
  worksArea: string[] | null;
  category: string | null;
  budget?: TBudgetData | null;
  description: string | null;

  // IDs  DE IMAGENES
  profileImageId: string | null;
  experienceImageIds: string[] | null;
};
