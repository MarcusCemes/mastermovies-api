import { Model, RelationMappings } from "objection";

import { Export } from "./export";
import { Group } from "./group";
import { Key } from "./key";
import { Thumbnail } from "./thumbnail";

export interface IFilm {
  id?: number;
  name: string;
  public: boolean;
  description?: string;
  release?: Date;
  location?: string;
  copyright?: string;
  crew?: { [index: string]: string };
  views?: number;
  runtime?: number;
}

export class Film extends Model {
  public static tableName = "glacier.film";
  public static schemaName = "glacier";
  public static idColumn = "id";

  public id?: number;

  public name: string;
  public public: boolean;

  public description?: string;
  public release?: Date;
  public location?: string;
  public copyright?: string;
  public crew?: { [index: string]: string };
  public views?: number;
  public runtime?: number;

  public keys?: Key[];
  public groups?: Group[];
  public thumbnails?: Thumbnail[];
  public exports?: Export[];

  static get relationMappings() {
    const mappings: RelationMappings = {
      keys: {
        relation: Model.ManyToManyRelation,
        modelClass: Key,
        join: {
          from: `${Film.tableName}.id`,
          through: {
            from: `${Film.schemaName}.film_keys.film_id`,
            to: `${Film.schemaName}.film_keys.key_id`
          },
          to: `${Key.tableName}.id`
        }
      },

      groups: {
        relation: Model.ManyToManyRelation,
        modelClass: Group,
        join: {
          from: `${Film.tableName}.id`,
          through: {
            from: `${Group.schemaName}.group_films.film_id`,
            to: `${Group.schemaName}.group_films.group_id`
          },
          to: `${Group.tableName}.id`
        }
      },

      thumbnails: {
        relation: Model.HasManyRelation,
        modelClass: Thumbnail,
        join: {
          from: `${Film.tableName}.id`,
          to: `${Thumbnail.tableName}.film_id`
        }
      },

      exports: {
        relation: Model.HasManyRelation,
        modelClass: Export,
        join: {
          from: `${Film.tableName}.id`,
          to: `${Export.tableName}.film_id`
        }
      }
    };

    return mappings;
  }
}
