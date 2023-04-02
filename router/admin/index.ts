import KoaRouter from 'koa-router';
import config from '../../config.js';
import KoaJwt from 'koa-jwt'
import type { AppContext, AppState } from '../../types.js'
import { authAdminHandler } from './authAdmin.js';
import { expireHandler } from './expire.js';
import { listHandler } from './list.js';
import { rechargeHandler } from './recharge.js';

export const adminRouter = new KoaRouter<AppState, AppContext>()
  .get('/recharge', KoaJwt({ secret: config.jwt.secret, }), authAdminHandler, rechargeHandler)
  .get('/expire', KoaJwt({ secret: config.jwt.secret, }), authAdminHandler, expireHandler)
  .get('/list', KoaJwt({ secret: config.jwt.secret, }), authAdminHandler, listHandler)

export const userRouter = new KoaRouter<AppState, AppContext>();
