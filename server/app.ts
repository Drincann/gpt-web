import Koa from 'koa'
import KoaBody from 'koa-bodyparser'
import { rootRouter } from './router'
import config from './config.js'
import { setChatStorage, setCodeStorage, setIPSendCodeButNotVerifyPerDayStorage, setIPSendCodeExpireStorage } from './middlewares/storage'
import type { AppState, AppContext } from './types'
import { logger } from './utils/logger'
import KoaStatic from 'koa-static'
import path from 'node:path'

// cmj patch
import { fileURLToPath } from "node:url";
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const staticPath = path.join(__dirname, 'public')
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
  .use(KoaStatic(staticPath))
  .listen(config.port, () => {
    logger.info(`[SERVER] Server is running on port ${config.port}`)
    logger.info(`[SERVER] Static files are served from ${staticPath}`)
  })

