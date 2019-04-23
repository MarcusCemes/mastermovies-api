import { Response } from "express";
import { STATUS_CODES } from "http";

export function statusResponse(res: Response, status: number) {
  res.status(status).json({status: status, message: STATUS_CODES[status]});
}