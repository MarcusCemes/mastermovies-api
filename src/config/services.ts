import { Schema } from "convict";

export interface IServicesConfig {
  email: {
    address: {
      operator: string;
      system: string;
    };
    smtp: {
      host: string;
      port: number;
    };
  };
}

export const ServicesConfig: Schema<IServicesConfig> = {
  email: {
    address: {
      operator: {
        doc: "The email address to forward contact requests to",
        format: String,
        default: "Marcus <marcus@mastermovies.uk>",
        env: "SERVICES_EMAIL_OPERATOR",
      },
      system: {
        doc: "The email address from which generated emails are sent",
        format: String,
        default: "MasterMovies <system@mastermovies.uk>",
        env: "SERVICES_EMAIL_SYSTEM",
      },
    },
    smtp: {
      host: {
        format: String,
        default: "host.docker.internal",
        env: "SMTP_HOST",
      },
      port: {
        format: Number,
        default: 587,
        env: "SMTP_PORT",
      },
    },
  },
};
