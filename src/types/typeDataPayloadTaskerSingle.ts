import { TDataPayloadUser } from "./typeDataPayloadUser";

// FIRMA DE ESTRUCTURA DE DATOS DE UN SOLO TASKER
export type TDataPayloadTaskerSingle = TDataPayloadUser & {
    isRepair:boolean;
    isWorkAreas:boolean;
    city:string;
    taskerId:string;
}