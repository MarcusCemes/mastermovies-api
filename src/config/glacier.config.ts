import { verifyConfig } from "./util";

export interface IGlacierConfig {
  glacier_film_storage: string;
  glacier_thumbnail_storage: string;
  glacier_view_threshold: number; // percentage of total film size
}

export const GlacierConfig: IGlacierConfig = verifyConfig(
  {
    glacier_film_storage: process.env.GLACIER_FILM_STORAGE,
    glacier_thumbnail_storage: process.env.GLACIER_THUMBNAIL_STORAGE,
    glacier_view_threshold: parseInt(process.env.GLACIER_VIEW_THRESHOLD, 10) || 0.2
  },
  [
    "glacier_film_storage",
    "glacier_thumbnail_storage",
    "glacier_view_threshold"
  ]
);
