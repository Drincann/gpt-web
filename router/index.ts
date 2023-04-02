import KoaRouter from 'koa-router';
import { userRouter } from './user/index.js';
import { chatRouter } from './chat/index.js';
import { adminRouter } from './admin/index.js';
import type { AppContext, AppState } from '../types.js'

const router = new KoaRouter<AppState, AppContext>()
  .use('/api', userRouter.routes(), userRouter.allowedMethods())
  .use('/api', chatRouter.routes(), chatRouter.allowedMethods())
  .use('/api', adminRouter.routes(), adminRouter.allowedMethods());
export const rootRouter = router;
