import { Request, Response } from 'express';
import { Either, Right } from 'purify-ts';
import { HttpError, UnauthorizedError } from './http-errors';

export type RouteContext = {
  req: Request;
  res: Response;
};

export type RouteResponse = {
  res: Response;
  body: unknown;
  status?: number;
};

export const sendResponse = (response: RouteResponse) => {
  const { res, body, status } = response;
  res.status(status ?? 200).send(body);
};

const mapHttpErrorToResponse = (
  error: HttpError
): Omit<RouteResponse, 'res'> => {
  if (error instanceof UnauthorizedError) {
    return { status: 401, body: { status: 401, message: 'Unauthorize' } };
  }
  return {
    status: 500,
    body: { status: 500, message: 'Internal Server Error' },
  };
};

export const sendErrorResponse = (res: Response) => (error: HttpError) => {
  const errorResp = mapHttpErrorToResponse(error);
  sendResponse({ ...errorResp, res });
};

export const handleRoute = (
  req: Request,
  res: Response
): Either<HttpError, RouteContext> => {
  return Right({ req, res, status: 200 });
};
