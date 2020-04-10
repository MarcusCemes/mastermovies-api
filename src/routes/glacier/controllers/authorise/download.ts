import Joi from "@hapi/joi";

import { Config } from "../../../../config";
import { signJwt } from "../../../../lib/jsonWebToken";
import { getEpoch } from "../../../../lib/utilities/getEpoch";
import { HTTP_CODES } from "../../../../middleware/respond";
import { IApiContext, IBasicJwtProperties } from "../../../../types/App";

interface IDownloadAuthRequest {
  resourceId: number;
}

interface IDownloadToken extends IBasicJwtProperties {
  resourceId: number;
}

const EXPIRES_IN: number = 43200;

/** Sign a authorisation token if the session contains a valid film authorisation */
export async function authoriseDownload(ctx: IApiContext) {
  // Validate the request payload
  const { error, value } = Joi.object()
    .keys({
      resourceId: Joi.number().required(),
    })
    .unknown(true)
    .validate<IDownloadAuthRequest>(ctx.request.body);

  if (error) {
    ctx.standard(HTTP_CODES.BAD_REQUEST, void 0, {
      error: error.message,
    });
    return;
  }

  const session = ctx.session.get();
  if (
    session &&
    session.glacier &&
    session.glacier.auth &&
    session.glacier.auth[value.resourceId] &&
    session.glacier.auth[value.resourceId] > getEpoch()
  ) {
    // Authorise the download
    const downloadToken = { resourceId: value.resourceId };
    ctx.standard(HTTP_CODES.OK, void 0, {
      authorisation: await signJwt<IDownloadToken>(
        downloadToken,
        Config.get("glacier").auth.download.secret,
        EXPIRES_IN,
        session.jti,
      ),
    });
  } else {
    ctx.standard(HTTP_CODES.FORBIDDEN);
  }
}
