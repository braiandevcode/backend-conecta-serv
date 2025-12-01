import { ECategory } from './enumCategory';
import { EDay } from './enumDay';
import { EHour } from './enumHour';
import { EServiceGarden } from './enumServiceGarden';
import { EServiceRepair } from './enumServiceRepair';
import { EServiceMoving } from './enumServicesMoving';
import { EWorkAreas } from './enumWorkAreas';

// EXPORTAR ARRAY DE STRING DEL ENUM DE HABITOS DE TRABAJO
export const VALID_WORK_AREAS: string[] = Object.values(EWorkAreas);

// EXPORTAR ARRAY DE STRING DEL ENUM DE DIAS
export const VALID_DAYS: string[] = Object.values(EDay);

// EXPORTAR ARRAY DE STRING DEL ENUM DE HORARIOS
export const VALID_HOURS: string[] = Object.values(EHour);

// EXPORTAR ARRAY DE STRING DEL ENUM DE DETALLES EN SERVICIOS DE MUDANZA Y TRANSPORTE
export const VALID_SERVICE_MOVING: string[] = Object.values(EServiceMoving);

// EXPORTAR ARRAY DE STRING DEL ENUM DE DETALLES EN SERVICIOS DE REPARACION Y MANTENMIENTO
export const VALID_SERVICE_REPAIR: string[] = Object.values(EServiceRepair);

// EXPORTAR ARRAY DE STRING DEL ENUM DE DETALLES EN SERVICIOS DE JARDINERIA
export const VALID_SERVICE_GARDEN: string[] = Object.values(EServiceGarden);

// OBJETO QUE QUE AGRUPA TODOS LOS ARRAY DE VALIDACION BAJO LAS CLAVES DE CATEGORIAS
export const SERVICES_BY_CATEGORY: Record<ECategory, string[]> = {
    //CORCHETES PARA QUE LA CLAVE SEA EL VALOR DEL ENUM
    [ECategory.GARDEN]: VALID_SERVICE_GARDEN,
    [ECategory.MOVE]: VALID_SERVICE_MOVING,
    [ECategory.REPAIR]: VALID_SERVICE_REPAIR,
};
