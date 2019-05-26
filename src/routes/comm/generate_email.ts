import { promises } from "fs";
import { SendMailOptions } from "nodemailer";
import { resolve } from "path";

import { CommConfig } from "../../config/comm.config";

const templatePath = resolve(__dirname, "../../../../static/email_template.html"); // TODO better solution?
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const clientSuccess =
`Hi there {{name}},<br><br>
Our system has received your message and will now be forwarded to a human being.<br>
You can expect a response time of about 24 hours. A copy of your message can be found bellow:<br><br>
Have a great day!<br><br>
Name: {{name}}<br>
Email: {{email}}<br>
Subject: {{subject}}<br>
Message:<br>
{{message}}
`;

const clientFailure =
`Hi there {{name}},<br><br>
Our system received your message, however there was an internal problem forwarding this to a human being<br>
We kindly ask you to send an email directly to <a href="mailto:marcus@mastermovies.uk">marcus@mastermovies.uk</a> instead.<br>
You may view your original message below.<br><br>
Thank you for your understanding, and have a great day!<br><br>
<b>Name:</b> {{name}}<br>
<b>Email:</b> {{email}}<br>
<b>Subject:</b> {{subject}}<br>
<b>Message:</b><br>
{{message}}
`;

const operatorEmailBody =
`Hi there,<br><br>
A new message has been relieved by the communication endpoint<br><br>
<b>Name:</b> {{name}}<br>
<b>Email:</b> {{email}}<br>
<b>Subject:</b> {{subject}}<br>
<b>Message:</b><br>
{{message}}
`;

export async function generateOperatorEmail(name: string = "<anonymous>", email: string = "<anonymous>", subject: string, message: string): Promise<SendMailOptions> {

  const template = await promises.readFile(templatePath);

  const body = operatorEmailBody
    .replace(/{{name}}/g, name)
    .replace(/{{email}}/g, email)
    .replace(/{{subject}}/g, subject)
    .replace(/{{message}}/g, message);

  return {
    from: CommConfig.system_email,
    to: CommConfig.operator_email,
    subject: "[OPERATOR] Communication Request",
    text: body,
    html: template.toString().replace(/{{body}}/g, body).replace(/{{preheader}}/g, "🦉 A new communication request has been received by the MasterMovies API – ")
  };
}

export async function generateUserEmail(success: boolean, name: string = "<anonymous>", email: string, subject: string, message: string): Promise<SendMailOptions> {

  if (typeof email !== "string" ||  !emailRegex.test(email)) return null;

  const template = await promises.readFile(templatePath);

  const body = (success? clientSuccess : clientFailure)
    .replace(/{{name}}/g, name)
    .replace(/{{email}}/g, email)
    .replace(/{{subject}}/g, subject)
    .replace(/{{message}}/g, message);

  return {
    from: CommConfig.system_email,
    to: email,
    subject: "Communication Request",
    text: body,
    html: template.toString().replace(/{{body}}/g, body).replace(/{{preheader}}/g, "🦉 Our little owl heard your message (" + subject + ") – ")
  };
}
