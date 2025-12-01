export interface iJwtPayload {
  sub: string;           // ID DEL USUARIO
  userName: string;      // NOMBRE DEL USUARIO
  email?: string;        // EMAIL ES OPCIONAL
  roles: string[];       // ARRAY DE NOMBRES DE ROLES ["client", "tasker"]
}