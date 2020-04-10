import Joi from "@hapi/joi";

import { HTTP_CODES } from "../../../../middleware/respond";
import { IApiContext } from "../../../../types/App";
import { authoriseDownload } from "./download";
import { authoriseFilm } from "./film";

const AUTH_TYPES: { [index: string]: (ctx: IApiContext) => Promise<void> } = {
  film: authoriseFilm,
  download: authoriseDownload,
};

interface IAuthRequest {
  type: keyof typeof AUTH_TYPES;
}

export async function authorise(ctx: IApiContext) {
  ctx.strictCors = true; // Restrict auth to the MasterMovies domain

  // Validate the request payload
  const { error, value } = Joi.object()
    .keys({
      type: Joi.string().required(),
    })
    .unknown(true)
    .validate<IAuthRequest>(ctx.request.body);

  if (error) {
    ctx.standard(HTTP_CODES.BAD_REQUEST, void 0, {
      error: error.message,
    });
    return;
  }

  // Redirect to the correct auth function
  if (typeof AUTH_TYPES[value.type] === "function") {
    await AUTH_TYPES[value.type](ctx);
  } else {
    ctx.standard(HTTP_CODES.BAD_REQUEST, "Unknown authorisation type");
  }
}
