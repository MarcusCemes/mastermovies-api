import { Schema } from "convict";

export interface IServicesConfig {
  email: {
    address: {
      operator: string;
      system: string;
    };
    sendgrid: {
      apiKey: string;
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
    sendgrid: {
      apiKey: {
        doc: "The API key for the SendGrid service",
        format: String,
        default: "",
        env: "SENDGRID_API_KEY",
        sensitive: true,
      },
    },
  },
};
