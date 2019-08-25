import Joi from "@hapi/joi";
import { promises } from "fs";
import nanoid = require("nanoid");
import { createTransport } from "nodemailer";
import { join, resolve } from "path";
import { RateLimiterMemory } from "rate-limiter-flexible";

import { ServicesConfig } from "../../../config/services";
import { logger } from "../../../lib/logger";
import { inject } from "../../../lib/placeholder";
import { HTTP_CODES } from "../../../middleware/respond";
import { ApiContext } from "../../../typings/App";

const ASSETS_PATH = resolve(join(__dirname, "../../../../assets"));

const TEMPLATE_PATHS = {
  body: "emails/templateWhite.hbs",
  operator: "emails/contact/operator.hbs",
  operatorText: "emails/contact/operatorText.hbs",
  client: "emails/contact/client.hbs",
  clientText: "emails/contact/clientText.hbs"
};

// Limit the amount of emails that can be sent
export const contactLimiter = new RateLimiterMemory({
  duration: 600,
  points: 3
});

const validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Mail transporter
const transporter = createTransport(
  ServicesConfig.get("smtpHost")
    ? ({
        host: ServicesConfig.get("smtpHost"),
        port: ServicesConfig.get("smtpPort"),
        auth: {
          type: "login",
          user: ServicesConfig.get("smtpUser"),
          pass: ServicesConfig.get("smtpPass")
        }
      } as unknown)
    : {
        sendmail: true,
        newline: "unix",
        path: "/usr/sbin/sendmail"
      }
);

interface IContactRequest {
  name?: string;
  email?: string;
  subject: string;
  message: string;
}

/** Submit a contact form */
export async function contact(ctx: ApiContext) {
  // Validate the request payload
  const { value, error } = Joi.object()
    .keys({
      name: Joi.string(),
      email: Joi.string(),
      subject: Joi.string().required(),
      message: Joi.string().required()
    })
    .validate<IContactRequest>(ctx.request.body);

  if (error) {
    ctx.standard(HTTP_CODES.BAD_REQUEST, void 0, {
      error: error.message
    });
    return;
  }

  // Limit contact requests
  try {
    await contactLimiter.consume(ctx.ip);
  } catch (err) {
    ctx.standard(HTTP_CODES.TOO_MANY_REQUESTS, "Contact requests are limited to 3 per hour");
    return;
  }

  await sendEmails(ctx, value.name, value.email, value.subject, value.message);

  ctx.standard(HTTP_CODES.OK);
}

async function sendEmails(ctx: ApiContext, name: string, email: string, subject: string, message: string) {
  if (email && !validEmail.test(email)) {
    ctx.standard(HTTP_CODES.BAD_REQUEST, "Invalid client email");
    return;
  }

  const ticket = nanoid();

  // Read each template from the filesystem
  const bodyTemplate = resolveAsset(TEMPLATE_PATHS.body);
  const operatorTemplate = resolveAsset(TEMPLATE_PATHS.operator);
  const operatorTextTemplate = resolveAsset(TEMPLATE_PATHS.operatorText);
  const clientTemplate = resolveAsset(TEMPLATE_PATHS.client);
  const clientTextTemplate = resolveAsset(TEMPLATE_PATHS.clientText);

  // Try to send the operator email
  try {
    const html = inject(await bodyTemplate, {
      body: inject(await operatorTemplate, { name, email, subject, message })
    });
    const text = inject(await operatorTextTemplate, { name, email, subject, message });

    // Errors will return a HTTP 500, informing the client to try again later
    await transporter.sendMail({
      to: ServicesConfig.get("operatorEmail"),
      from: ServicesConfig.get("systemEmail"),
      subject: "🦉 An owl has been spotted!",
      references: `system+${ticket}@mastermovies.uk`,
      html,
      text
    });
  } catch (err) {
    logger.error({ msg: "Failed to send operator email", err: err.message });
    ctx.standard(HTTP_CODES.INTERNAL_SERVER_ERROR);
    return;
  }

  // Try to send the client email
  try {
    const html = inject(await bodyTemplate, {
      body: inject(await clientTemplate, { name, ticket })
    });
    const text = inject(await clientTextTemplate, { name, ticket });

    // Errors will return a HTTP 500, informing the client to try again later
    await transporter.sendMail({
      to: /^[a-zA-Z\u00C0-\u00FF\s]*$/.test(email) ? `${name} <${email}>` : email,
      from: ServicesConfig.get("systemEmail"),
      subject: "🦉 An owl has been spotted!",
      references: `system+${ticket}@mastermovies.uk`,
      html,
      text
    });
  } catch (err) {
    logger.warn({ msg: "Client email failure. Operator email sent", err: err.message });
  }
}

function resolveAsset(path: string): Promise<string> {
  return promises.readFile(join(ASSETS_PATH, path)).then(v => v.toString());
}
