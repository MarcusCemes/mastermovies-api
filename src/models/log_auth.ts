import { Model, RelationMappings } from "objection";

import { Film } from "./film";
import { Key } from "./key";

export interface ILogAuth {
  id?: number;
  timestamp: Date;
  ip: string;
  success: boolean;
}

export class LogAuth extends Model {
  public static tableName = "glacier.log_auth";
  public static schemaName = "glacier";
  public static idColumn = "id";

  public id?: number;

  public timestamp: Date;
  public ip: string;
  public success: boolean;

  public film?: Film;
  public key?: Key;

  // tslint:disable-next-line member-ordering
  public static relationMappings: RelationMappings = {
    film: {
      relation: Model.BelongsToOneRelation,
      modelClass: Film,
      join: {
        from: `${LogAuth.tableName}.film_id`,
        to: `${Film.tableName}.id`,
      },
    },
    key: {
      relation: Model.BelongsToOneRelation,
      modelClass: Key,
      join: {
        from: `${LogAuth.tableName}.key_id`,
        to: `${Key.tableName}.id`,
      },
    },
  };
}
