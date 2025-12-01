export class JoinMannager {
  private constructor() {} // NO SE INSTANCIA, SOLO USO ESTATICO

  // RECIBE UN OBJETO CON LOS DATOS DE LA ENTIDAD ACTUAL Y RELACIONADA
  public static manyToManyConfig(params: {
    name?: string;
    current: { name: string; referencedColumnName: string; fkName?: string };
    related: { name: string; referencedColumnName: string; fkName?: string };
  }) {
    return {
      name: params.name,
      joinColumn: {
        name: params.current.name,
        referencedColumnName: params.current.referencedColumnName,
        foreignKeyConstraintName: params.current.fkName,
      },
      inverseJoinColumn: {
        name: params.related.name,
        referencedColumnName: params.related.referencedColumnName,
        foreignKeyConstraintName: params.related.fkName,
      },
    };
  }

  // RECIBE UN OBJETO CON LOS DATOS DE LA ENTIDAD ACTUAL Y RELACIONADA
  public static manyToOneConfig(params: {
    current: { name?: string; referencedColumnName?: string; fkName?: string };
  }) {
    return {
      name: params.current.name,
      referencedColumnName: params.current.referencedColumnName,
      foreignKeyConstraintName: params.current.fkName,
    };
  }
}
