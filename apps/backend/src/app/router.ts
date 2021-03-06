import * as express from 'express';
import { Either } from 'purify-ts';
import { HttpError } from './http-errors';
import {
  handleRoute,
  RouteContext,
  RouteResponse,
  sendErrorResponse,
  sendResponse,
} from './router-handler';

const exRouter = express.Router();

export type RouteHandler = (
  route: Either<HttpError | Error, RouteContext>
) => Either<HttpError | Error, RouteResponse>;

export const router = {
  get(path: string, handler: RouteHandler) {
    exRouter.get(path, (req, res) => {
      const route = handleRoute(req, res);
      handler(route).bimap(sendErrorResponse(res), sendResponse);
    });
  },

  post(path: string, handler: RouteHandler) {
    exRouter.post(path, (req, res) => {
      const route = handleRoute(req, res);
      handler(route).bimap(sendErrorResponse(res), sendResponse);
    });
  },

  init(app: ReturnType<typeof express>) {
    app.use(exRouter);
  },
};
