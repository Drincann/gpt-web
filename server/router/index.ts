import KoaRouter from 'koa-router';
import { userRouter } from './user';
import { chatRouter } from './chat';
import { adminRouter } from './admin';
import type { AppContext, AppState } from '../types'

const router = new KoaRouter<AppState, AppContext>()
  .use('/api', userRouter.routes(), userRouter.allowedMethods())
  .use('/api', chatRouter.routes(), chatRouter.allowedMethods())
  .use('/api', adminRouter.routes(), adminRouter.allowedMethods());
export const rootRouter = router;
