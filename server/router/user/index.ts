import KoaRouter from 'koa-router';
import { codeHandler } from './code';
import { loginHandler } from './login';
import type { AppContext, AppState } from '../../types'
import KoaJwt from 'koa-jwt';
import config from '../../config';
import { checkHandler } from './check';

export const userRouter = new KoaRouter<AppState, AppContext>()
  .post('/login', loginHandler)
  .get('/code', codeHandler)
  .get('/check', KoaJwt({ secret: config.jwt.secret }), checkHandler)
