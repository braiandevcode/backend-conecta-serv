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

  profileImageUrl: string;
  experienceImagesUrl: string[];
};


