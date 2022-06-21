import { Request, Response } from 'express';
import { Either, Maybe } from 'purify-ts';
import { HttpError, UnauthorizedError } from './http-errors';

export type HttpMethod = 'get';

type HttpResponse<T = unknown> = {
  status?: number;
  body: T;
};

type Callback<T extends HttpResponse> = (
  req: Request,
  res: Response
) => T | Maybe<T> | Either<HttpError, T>;

const sendResponse = (res: Response) => (httpRes: HttpResponse) => {
  res.status(httpRes.status ?? 200).send(httpRes.body);
};

const mapHttpErrorToResponse = (error: HttpError): HttpResponse => {
  if (error instanceof UnauthorizedError) {
    return { status: 401, body: { status: 401, message: 'Unauthorize' } };
  }
  return {
    status: 500,
    body: { status: 500, message: 'Internal Server Error' },
  };
};

export const handleRoute = <T extends HttpResponse>(callback: Callback<T>) => {
  return (req: Request, res: Response) => {
    const cbValue = callback(req, res);

    if (Maybe.isMaybe(cbValue)) {
      cbValue
        .toEither({
          status: 404,
          body: { status: 404, message: 'Not Found' },
        })
        .bimap(sendResponse(res), sendResponse(res));
    } else if (Either.isEither(cbValue)) {
      cbValue
        .mapLeft(mapHttpErrorToResponse)
        .bimap(sendResponse(res), sendResponse(res));
    } else {
      res.send(200).send(cbValue);
    }
  };
};
