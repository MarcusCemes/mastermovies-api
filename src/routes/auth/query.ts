// MasterMovies API - Authorization/Query
// Return the current active JWT object, which is HTTP protected
import { Request, Response } from "express";

import { extractJwt } from "../../common/jwt";


export async function query(req: Request, res: Response, _next: (err?: Error) => void) {

  const user = await req.user;
  const queryResponse = extractJwt(user.data);
  res.status(200).json(queryResponse);

}