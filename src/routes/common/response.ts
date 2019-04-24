import { Response } from "express";
import { STATUS_CODES } from "http";

/** Respond with a standard status code + JSON message */
export function statusResponse(res: Response, status: number, message?: string): void {
  const response = { status, message: STATUS_CODES[status] };
  if (message) response.message = message;
  res.status(status).json(response);
}