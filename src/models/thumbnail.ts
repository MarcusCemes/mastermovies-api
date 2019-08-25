import { Model, RelationMappings } from "objection";

import { Film } from "./film";

export interface IThumbnail {
  id?: number;
  film_id: number;
  width?: number;
  height?: number;
  mime?: string;
}

export class Thumbnail extends Model {
  public static tableName = "glacier.thumbnail";
  public static schemaName = "glacier";
  public static idColumn = "id";

  public id?: number;

  public width?: number;
  public height?: number;
  public mime?: string;

  public film?: Film;

  public static get relationMappings() {
    const mappings: RelationMappings = {
      film: {
        relation: Model.BelongsToOneRelation,
        modelClass: Film,
        join: {
          from: `${Thumbnail.tableName}.film_id`,
          to: `${Film.tableName}.id`
        }
      }
    };
    return mappings;
  }
}
