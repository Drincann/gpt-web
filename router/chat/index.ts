import KoaRouter from 'koa-router';
import config from '../../config.js';
import KoaJwt from 'koa-jwt'
import type { AppContext, AppState } from '../../types.js'
import { chatHandler } from './chat.js';
import { contextHandler } from './context.js';

export const chatRouter = new KoaRouter<AppState, AppContext>()
  .post('/chat', KoaJwt({ secret: config.jwt.secret, }), chatHandler)
  .get('/context', KoaJwt({ secret: config.jwt.secret, }), contextHandler)
