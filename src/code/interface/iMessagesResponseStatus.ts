import { HttpStatus } from "@nestjs/common";

export interface iMessageResponseStatus{
    message:string; 
    success: boolean;
    status:HttpStatus;
}