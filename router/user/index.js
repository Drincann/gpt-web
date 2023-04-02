import KoaRouter from 'koa-router';
import { codeHandler } from './code.js';
import { loginHandler } from './login.js';
import KoaJwt from 'koa-jwt';
import config from '../../config.js';
import { checkHandler } from './check.js';
export const userRouter = new KoaRouter()
    .post('/login', loginHandler)
    .get('/code', codeHandler)
    .get('/check', KoaJwt({ secret: config.jwt.secret }), checkHandler);
