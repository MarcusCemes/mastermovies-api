import { Model, RelationMappings } from "objection";

import { Film } from "./film";
import { Key } from "./key";

export interface IGroup {
  id?: number;
  name: string;
  description?: string;
}

export class Group extends Model {
  public static tableName = "glacier.group";
  public static schemaName = "glacier";
  public static idColumn = "id";

  public id?: number;

  public name: string;
  public description?: string;

  public films?: Film[];
  public keys?: Key[];

  static get relationMappings() {
    const mappings: RelationMappings = {
      films: {
        relation: Model.ManyToManyRelation,
        modelClass: Film,
        join: {
          from: `${Group.tableName}.id`,
          through: {
            from: `${Group.schemaName}.group_films.group_id`,
            to: `${Group.schemaName}.group_films.film_id`
          },
          to: `${Film.tableName}.id`
        }
      },

      keys: {
        relation: Model.ManyToManyRelation,
        modelClass: Key,
        join: {
          from: `${Group.tableName}.id`,
          through: {
            from: `${Group.schemaName}.group_keys.group_id`,
            to: `${Group.schemaName}.group_keys.key_id`
          },
          to: `${Key.tableName}.id`
        }
      }
    };

    return mappings;
  }
}
