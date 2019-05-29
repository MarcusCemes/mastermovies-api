import { promises } from "fs";
import { SendMailOptions } from "nodemailer";
import { resolve } from "path";

import { CommConfig } from "../../config/comm.config";

const templatePath = resolve(__dirname, "../../../../static/email_template.html"); // TODO better solution?
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const clientSuccess =
`<p>Hi {{name}}</p>
<p>
This is just to let you know that we got your message loud and clear.<br />
We will do our best to reply directly to this email address within 24 hours.
</p>

<p>
Received this email by mistake? Somebody probably just mistyped their email. This is a one-off notification.
</p>

<p>
A copy of your message can be found below.<br />
Have a great day!<br />
<b>MasterMovies</b>
</p>

<p><i>This is an automatically generated email</i></p>

<p>
<b>Name:</b> {{name}}<br>
<b>Email:</b> {{email}}<br>
<b>Subject:</b> {{subject}}<br>
<b>Message:</b><br>
{{message}}
</p>
`;

const clientFailure =
`<p>Hi {{name}}</p>
<p>
Sorry to bring bad news, but we encountered an internal error while processing your message.
</p>

<p>
We kindly ask that you resend your message to <a href="mailto:marcus@mastermovies.uk">marcus@mastermovies.uk</a> instead.
</p>

<p>Thank you for your understanding</p>

<p>
Received this email by mistake? Somebody probably just mistyped their email. This is a one-off notification.
</p>

<p>
A copy of your message can be found below.<br />
Have a great day!<br />
<b>MasterMovies</b>
</p>

<p><i>This is an automatically generated email</i></p>

<p>
<b>Name:</b> {{name}}<br>
<b>Email:</b> {{email}}<br>
<b>Subject:</b> {{subject}}<br>
<b>Message:</b><br>
{{message}}
</p>`;

const operatorEmailBody =
`Hi there,<br><br>
A new message has been relieved by the communication endpoint<br><br>
<b>Name:</b> {{name}}<br>
<b>Email:</b> {{email}}<br>
<b>Subject:</b> {{subject}}<br>
<b>Message:</b><br>
{{message}}`;

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
    subject: "🦉 An owl has been spotted!",
    text: body,
    html: template.toString().replace(/{{body}}/g, body).replace(/{{preheader}}/g, "We got your message about " + subject + " loud and clear! – ")
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
    subject: "🦉 An owl has been spotted!",
    text: body,
    html: template.toString().replace(/{{body}}/g, body).replace(/{{preheader}}/g, "We received your contact form and will reply promptly (" + subject + ") – ")
  };
}
