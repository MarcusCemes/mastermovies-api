import { Response } from "express";
import { STATUS_CODES } from "http";

interface IStatusResponse {
  code: number;
  status: string;
  message?: string;
}

/** Respond with a standard status code + JSON message */
export function statusResponse(
  res: Response,
  code: number,
  message?: string
): void {
  const response: IStatusResponse = {
    code,
    status: STATUS_CODES[code],
    message
  };
  res.status(code).json(response);
}
