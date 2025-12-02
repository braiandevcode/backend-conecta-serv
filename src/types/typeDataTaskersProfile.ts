export type TActiveTaskerUser = {
  idUser: string;
  fullName: string;
  userName: string;

  roles: {
    idRole: string;
    nameRole: string;
  }[];

  tasker: {
    idTasker: string;
    description: string | null;
    idCategory: string | null;
  };

  days: string[];
  hours: string[];
  services: string[];
  worksArea: string[];
  category: string;

  profileImageUrl: string;
  experienceImagesUrl: string[];
};