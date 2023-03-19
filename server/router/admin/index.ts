import KoaRouter from 'koa-router';
import config from '../../config';
import KoaJwt from 'koa-jwt'
import type { AppContext, AppState } from '../../types'
import { authAdminHandler } from './authAdmin';
import { expireHandler } from './expire';
import { listHandler } from './list';
import { rechargeHandler } from './recharge';

export const adminRouter = new KoaRouter<AppState, AppContext>()
  .get('/recharge', KoaJwt({ secret: config.jwt.secret, }), authAdminHandler, rechargeHandler)
  .get('/expire', KoaJwt({ secret: config.jwt.secret, }), authAdminHandler, expireHandler)
  .get('/list', KoaJwt({ secret: config.jwt.secret, }), authAdminHandler, listHandler)

export const userRouter = new KoaRouter<AppState, AppContext>();
