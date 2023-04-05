import { parseBody } from "../../utils/parseBody.js"
import { errorHandler } from "../../utils/errorHandler.js"
import { isPhone } from "../../utils/isPhone.js"
import { sendCode, sendCodeUsingTencentCloud } from "../../services/code.js"
import { generateCode } from "../../utils/generateCode.js"
import config from "../../config.js"
import { logger } from "../../utils/logger.js"

export const codeHandler = errorHandler(parseBody(async (ctx, next, phone: string) => {
  logger.info(`[USER] codeHandler: ${JSON.stringify({ phone })}`)
  if (typeof phone !== "string" || !isPhone(phone)) return ctx.body = { code: 400, message: "参数错误", }
  if (ctx.ipSendCodeExpireStorage.get(ctx.ip)) return ctx.body = { code: 400, message: "请勿频繁发送", }
  if ((ctx.ipSendCodeButNotVerifyPerDayStorage.get(ctx.ip)?.cnt ?? 0) >= config.codeService.ipSendButNotVerifyLimitPerday) return ctx.body = { code: 400, message: "今日发送次数过多，请明日再来", }
  const code = generateCode(4);
  const success = await sendCodeUsingTencentCloud(phone, code);
  if (!success) {
    logger.error(`[USER] ${ctx.ip} send code to ${phone} failed`)
    return ctx.body = { code: 500, message: "发送失败，请稍后重试", }
  }
  logger.info(`[USER] ${ctx.ip} send code [${code}] to ${phone} success`)
  ctx.codeStorage.set(phone, { code, })
  ctx.ipSendCodeExpireStorage.set(ctx.ip, true)
  ctx.ipSendCodeButNotVerifyPerDayStorage.set(ctx.ip, { cnt: (ctx.ipSendCodeButNotVerifyPerDayStorage.get(ctx.ip)?.cnt ?? 0) + 1 })
  return ctx.body = { code: 200, message: "发送成功", data: null }
}))