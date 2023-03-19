import KoaRouter from 'koa-router';
import config from '../../config';
import KoaJwt from 'koa-jwt'
import type { AppContext, AppState } from '../../types'
import { chatHandler } from './chat';
import { contextHandler } from './context';

export const chatRouter = new KoaRouter<AppState, AppContext>()
  .post('/chat', KoaJwt({ secret: config.jwt.secret, }), chatHandler)
  .get('/context', KoaJwt({ secret: config.jwt.secret, }), contextHandler)
