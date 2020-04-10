import { Schema } from "convict";

export interface IServicesConfig {
  email: {
    address: {
      operator: string;
      system: string;
    };
    smtp: {
      useShell: boolean;
      host: string;
      port: number;
      user: string;
      password: string;
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
      useShell: {
        doc: "use the `sendmail` shell command over the SMTP protocol",
        format: Boolean,
        default: true,
        env: "SERVICES_SMTP_USE_SHELL",
      },
      host: {
        doc: "If specified, this SMPT host will be used over local sendmail command",
        format: String,
        default: "",
        env: "SERVICES_SMTP_HOST",
      },
      port: {
        doc: "The port for the SMPT server",
        format: Number,
        default: 587,
        env: "SERVICES_SMTP_PORT",
      },
      user: {
        doc: "The username for the SMPT server",
        format: String,
        default: "",
        env: "SERVICES_SMTP_USER",
      },
      password: {
        doc: "The password for the SMPT server",
        format: String,
        default: "",
        env: "SERVICES_SMTP_PASSWORD",
        sensitive: true,
      },
    },
  },
};
