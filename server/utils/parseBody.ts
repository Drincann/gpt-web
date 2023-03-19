import Koa from 'koa'
import { parseParams } from './reflect'

export const parseBody = <Params extends unknown[] | []>(controller: (ctx: Koa.Context, next: Koa.Next, ...args: [...Params]) => unknown) => {
  return async (ctx: Koa.Context, next: Koa.Next) => {
    let body: Record<string, unknown> = Object.assign({}, ctx.request.query, ctx.request.body ?? {});
    await controller(ctx, next, ...parseParams(controller).map(key => body[key]).slice(2) as [...Params])
  }
}