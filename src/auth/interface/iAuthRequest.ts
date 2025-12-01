import { iJwtPayload } from "./iJwtPayload";
// PARA EL TIPO DE REQUEST
export interface AuthRequest extends Request {
  user: iJwtPayload;
  ip?:string;
}