import { parseBody } from '../../utils/parseBody'
import { userRepo } from '../../db'
import config from '../../config.js'
import { isPhone } from '../../utils/isPhone'
import { errorHandler } from '../../utils/errorHandler'
import jwt from 'jsonwebtoken'
import { logger } from '../../utils/logger'

export const loginHandler = errorHandler(parseBody(async (ctx, next, phone: string, code: string) => {
  logger.info(`[USER] loginHandler: ${JSON.stringify({ phone, code })}`)
  // 参数校验
  if (typeof phone !== 'string' || typeof code !== 'string' || !isPhone(phone)) {
    ctx.body = { code: 400, message: '参数错误', }
    return
  }

  // 验证码校验
  const { codeStorage } = ctx;
  const codeStoraged = codeStorage.get(phone);
  if (codeStoraged?.code !== code) {
    logger.info(`[USER] ${ctx.ip} login failed: code not match`)
    ctx.body = { code: 401, message: '验证码已过期，请重新获取', }
    return
  }

  // 校验用户
  const [user] = await userRepo.find({ conditions: { phone, }, limit: 1, offset: 0 })
  if (!user) {
    logger.info(`[USER] ${ctx.ip} create new user: ${phone}`)
    // 自动注册
    await userRepo.insert({
      phone,
      chat_balance: config.vip.defaultBalance,
      expire: config.vip.defaultDate(),
      name: phone,
    })
  }

  const token = await new Promise<string | undefined>(
    resolve => jwt.sign(
      { phone, }, config.jwt.secret, { expiresIn: '30d', },
      (_, token) => resolve(token)
    )
  )

  if (!token) {
    logger.error(`[USER] ${ctx.ip} login failed: jwt sign failed`)
    return ctx.body = { code: 500, message: '服务器错误', }
  }
  logger.info(`[USER] ${ctx.ip} login success: ${phone}`)
  ctx.ipSendCodeButNotVerifyPerDayStorage.set(ctx.ip, { cnt: (ctx.ipSendCodeButNotVerifyPerDayStorage.get(ctx.ip)?.cnt ?? 0) - 1 })
  ctx.body = { code: 200, message: '登录成功', data: { token }, }
}))