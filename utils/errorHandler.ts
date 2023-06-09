import Koa from 'koa'
import { logger } from '../utils/logger.js'
export const errorHandler = <T extends Koa.Middleware>(fn: T): Koa.Middleware => {
  return async (ctx: Koa.Context, next: () => Promise<any>) => {
    return fn(ctx as any, next).catch((err: any) => {
      logger.error(err)
      ctx.status = 500
      ctx.body = {
        code: err.code ?? 500,
        message: 'Internal Server Error'
      }
    })
  }
}