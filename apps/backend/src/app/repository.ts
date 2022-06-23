import { Model as MongooseModel } from 'mongoose';
import { EitherAsync, Left, Right } from 'purify-ts';

export type CreateUserDto = { user: string; password: string };

export const createRepository = <Entity, Model extends MongooseModel<Entity>>(
  model: Model
) => {
  const create = <Context extends { dto: CreateUserDto }>(
    ctx: Context
  ): EitherAsync<Error, Context & { entity: Entity }> => {
    return EitherAsync.fromPromise(async () => {
      try {
        const modelInstance = new model(ctx.dto);
        const entity = (await modelInstance.save()) as Entity;
        return Right({ ...ctx, entity });
      } catch (e) {
        return Left(e as Error);
      }
    });
  };

  return { create };
};
