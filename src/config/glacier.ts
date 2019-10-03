import { Schema } from "convict";
import { randomBytes } from "crypto";

export interface IGlacierConfig {
  path: string;
  auth: {
    film: {
      lifetime: number;
    };
    download: {
      secret: Buffer;
      lifetime: number;
    };
  };
}

export const GlacierConfig: Schema<IGlacierConfig> = {
  path: {
    doc: "The filesystem path to the Glacier Content directory",
    format: String,
    default: "/var/glacier",
    env: "GLACIER_PATH"
  },
  auth: {
    film: {
      lifetime: {
        doc: "How long a film authorisation should last (seconds)",
        format: Number,
        default: 86400,
        env: "GLACIER_AUTH_FILM_LIFETIME"
      }
    },
    download: {
      secret: {
        doc: "The secret to use to sign download requests (64 bytes in hex or base64)",
        format: "buffer64",
        default: randomBytes(64),
        env: "GLACIER_AUTH_DOWNLOAD_SECRET",
        sensitive: true
      },
      lifetime: {
        doc: "How long a download authorisation should last (seconds)",
        format: Number,
        default: 43200,
        env: "GLACIER_AUTH_DOWNLOAD_LIFETIME"
      }
    }
  }
};
