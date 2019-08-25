import { createConfig } from "./utils";

export const ServicesConfig = createConfig("ServicesConfig", {
  operatorEmail: {
    doc: "The email address to forward contact requests to",
    format: String,
    default: "Marcus <marcus@mastermovies.uk>",
    env: "CONTACT_OPERATOR_EMAIL"
  },
  systemEmail: {
    doc: "The email address from which generated emails are sent",
    format: String,
    default: "MasterMovies <system@mastermovies.uk>",
    env: "CONTACT_SYSTEM_EMAIL"
  },
  smtpHost: {
    doc: "If specified, this SMPT host will be used over local sendmail command",
    format: String,
    default: "",
    env: "MAIL_SMTP_HOST"
  },
  smtpPort: {
    doc: "The port for the SMPT server",
    format: Number,
    default: 587,
    env: "MAIL_SMTP_PORT"
  },
  smtpUser: {
    doc: "The username for the SMPT server",
    format: String,
    default: "",
    env: "MAIL_SMTP_USER"
  },
  smtpPass: {
    doc: "The password for the SMPT server",
    format: String,
    default: "",
    env: "MAIL_SMTP_PASS"
  }
});
