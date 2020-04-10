import { Model, RelationMappings } from "objection";
import { Film } from "./film";

export interface IExport {
  id?: number;
  film_id: number;
  filename: string;
  width?: number;
  height?: number;
  mime?: string;
  size?: number;
  videoCodec?: string;
  audioCodec?: string;
  checksum?: { [index: string]: string };
  bitrate?: number;
}

export class Export extends Model {
  public static tableName = "glacier.export";
  public static schemaName = "glacier";
  public static idColumn = "id";

  public id?: number;

  public filename: string;

  public width?: number;
  public height?: number;
  public mime?: string;
  public size?: number;
  public videoCodec?: string;
  public audioCodec?: string;
  public checksum?: { [index: string]: string };
  public bitrate?: number;

  public film?: Film;

  public static get relationMappings() {
    const mappings: RelationMappings = {
      film: {
        relation: Model.BelongsToOneRelation,
        modelClass: Film,
        join: {
          from: `${Export.tableName}.film_id`,
          to: `${Film.tableName}.id`,
        },
      },
    };
    return mappings;
  }
}
