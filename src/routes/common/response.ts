import { Response } from "express";
import { STATUS_CODES } from "http";

interface IStatusResponse {
  status: number;
  code: string;
  message?: string;
}

/** Respond with a standard status code + JSON message */
export function statusResponse(
  res: Response,
  status: number,
  message?: string
): void {
  const response: IStatusResponse = {
    status,
    code: STATUS_CODES[status],
    message
  };
  res.status(status).json(response);
}
