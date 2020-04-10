import { Model, RelationMappings } from "objection";

import { Film } from "./film";
import { Group } from "./group";

export interface IKey {
  id?: number;
  value: string;
  expiry?: Date;
}
export class Key extends Model {
  public static tableName = "glacier.key";
  public static schemaName = "glacier";
  public static idColumn = "id";

  public id?: number;

  public value: string;
  public expiry?: Date;

  public films?: Film[];
  public groups?: Group[];

  static get relationMappings() {
    const mappings: RelationMappings = {
      films: {
        relation: Model.ManyToManyRelation,
        modelClass: Film,
        join: {
          from: `${Key.tableName}.id`,
          through: {
            from: `${Film.schemaName}.film_keys.key_id`,
            to: `${Film.schemaName}.film_keys.film_id`,
          },
          to: `${Film.tableName}.id`,
        },
      },

      groups: {
        relation: Model.ManyToManyRelation,
        modelClass: Group,
        join: {
          from: `${Key.tableName}.id`,
          through: {
            from: `${Group.schemaName}.group_keys.key_id`,
            to: `${Group.schemaName}.group_keys.group_id`,
          },
          to: `${Group.tableName}.id`,
        },
      },
    };

    return mappings;
  }
}
