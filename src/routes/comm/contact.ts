// MasterMovies API - Communication/Contact
// Submit a contact request to MasterMovies
import { Request, Response } from "express";
import { createTransport } from "nodemailer";
import { RateLimiterMemory } from "rate-limiter-flexible";

import { hit } from "../../common/middleware/rateLimiter";
import { statusResponse } from "../common/statusResponse";
import { generateOperatorEmail, generateUserEmail } from "./generate_email";

// Create authentication rate limiting
export const contactLimiter = new RateLimiterMemory({
  duration: 600,
  points: 3
});

const transporter = createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail'
});

export interface ICommContactRequest {
  name?: string;
  email?: string;
  subject: string;
  message: string;
}


export async function contact(req: Request, res: Response, next: (err?: Error) => void) {

  const payload: ICommContactRequest = req.body;
  if (!payload) {
    statusResponse(res, 400, "Missing payload");
    return;
  }

  const { name, email, subject, message } = payload;
  if (typeof subject !== "string" || typeof message !== "string") {
    statusResponse(res, 400, "Malformed authorization request");
    return;
  }

  const reward = await hit(contactLimiter, req.ip, res);
  if (typeof reward !== "function") {
    statusResponse(res, 429, "Too many sent emails");
    return;
  };

  try {

    // Attempt to send the operator email
    const operatorEmail = await generateOperatorEmail(name, email, subject, message);
    let operatorSuccess = false;
    let operatorError;
    try {
      await transporter.sendMail(operatorEmail);
      operatorSuccess = true;
    } catch (err) {
      operatorError = err;
    }

    // Attempt to send the user email if the email is valid
    const userEmail = await generateUserEmail(operatorSuccess, name, email, subject, message);
    if (userEmail) {
      try {
          await transporter.sendMail(userEmail);
      } catch (err) {/* */}
    }

    if (operatorSuccess) {
      statusResponse(res, 200);
      return;
    }

    throw operatorError;

  } catch (err) {
    next(err);
    return;
  }

}