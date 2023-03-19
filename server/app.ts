import Koa from 'koa'
import KoaBody from 'koa-bodyparser'
import { rootRouter } from './router'
import config from './config.js'
import { setChatStorage, setCodeStorage, setIPSendCodeButNotVerifyPerDayStorage, setIPSendCodeExpireStorage } from './middlewares/storage'
import type { AppState, AppContext } from './types'
import { logger } from './utils/logger'

const app = new Koa<AppState, AppContext>()
app.use(KoaBody())
  .use(async (ctx, next) => {
    const start = Date.now()
    logger.info(`[SERVER] Request: ${ctx.method} ${ctx.url}`)
    await next()
    logger.info(`[SERVER] Response: ${ctx.method} ${ctx.url} ${ctx.status} cost ${Date.now() - start}ms ${JSON.stringify(ctx.body)}`)
  })
  .use(setChatStorage(config.gpt.memoryExpire))
  .use(setCodeStorage(config.codeService.codeExpire))
  .use(setIPSendCodeExpireStorage(config.codeService.ipSendCodeExpire))
  .use(setIPSendCodeButNotVerifyPerDayStorage(1000 * 60 * 60 * 24))
  .use(rootRouter.routes())
  .use(rootRouter.allowedMethods())
  .listen(config.port, () => {
    logger.info(`Server is running on port ${config.port}`)
  })

