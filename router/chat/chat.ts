import config from "../../config.js";
import { errorHandler } from "../../utils/errorHandler.js"
import { parseBody } from "../../utils/parseBody.js"
import { userRepo } from "../../db/index.js"
import { createChatContext } from "../../services/ChatContext.js";
import { logger } from "../../utils/logger.js";
import { Stream } from "stream";

export const streamChatHandler = errorHandler(parseBody(async (ctx, next, message: string) => {
  logger.info(`[CHAT] chatHandler: ${JSON.stringify({ message })}`)
  if (typeof message !== "string") return ctx.body = { code: 400, message: "信息不能为空", }
  if (message.length > config.gpt.maxLengthInSingleRequest) return ctx.body = { code: 400, message: "信息过长", }
  const [user] = await userRepo.find({ conditions: { phone: ctx.state.user.phone, }, limit: 1, offset: 0 })
  if (!user) return ctx.body = { code: 401, message: "用户不存在", }
  const useBalance = (user.expire?.getTime() ?? 0) > Date.now() ? false : true
  if (useBalance && (user?.chat_balance ?? 0) <= 0) return ctx.body = { code: 402, message: "余额不足", }
  logger.info(`[CHAT] user: ${ctx.state.user.phone}, useBalance: ${useBalance}, balance: ${user?.chat_balance ?? 0}, expire: ${user?.expire ?? "never"}`)

  // chat
  const { chatStorage } = ctx;
  let chatContext = chatStorage.get(ctx.state.user.phone)
  if (!chatContext) chatContext = chatStorage.set(
    ctx.state.user.phone,
    createChatContext({ secret: config.gpt.secret, model: config.gpt.model, maxToken: config.gpt.maxToken, })
  )
  const result = await chatContext?.stream({ role: "user", content: message, })
  if (result instanceof Stream) {
    if (useBalance) {
      userRepo.update({ chat_balance: (user?.chat_balance ?? 0) - 1, }, ctx.state.user.phone)
    }
    ctx.body = result
  } else {
    logger.error(`[CHAT] failed to call openai: ${JSON.stringify(result)}`)
    return ctx.body = { code: 500, message: "失败", data: null, }
  }
}))

export const chatHandler = errorHandler(parseBody(async (ctx, next, message: string) => {
  logger.info(`[CHAT] chatHandler: ${JSON.stringify({ message })}`)
  if (typeof message !== "string") return ctx.body = { code: 400, message: "信息不能为空", }
  if (message.length > config.gpt.maxLengthInSingleRequest) return ctx.body = { code: 400, message: "信息过长", }
  const [user] = await userRepo.find({ conditions: { phone: ctx.state.user.phone, }, limit: 1, offset: 0 })
  if (!user) return ctx.body = { code: 401, message: "用户不存在", }
  const useBalance = (user.expire?.getTime() ?? 0) > Date.now() ? false : true
  if (useBalance && (user?.chat_balance ?? 0) <= 0) return ctx.body = { code: 402, message: "余额不足", }
  logger.info(`[CHAT] user: ${ctx.state.user.phone}, useBalance: ${useBalance}, balance: ${user?.chat_balance ?? 0}, expire: ${user?.expire ?? "never"}`)

  // chat
  const { chatStorage } = ctx;
  let chatContext = chatStorage.get(ctx.state.user.phone)
  if (!chatContext) chatContext = chatStorage.set(
    ctx.state.user.phone,
    createChatContext({ secret: config.gpt.secret, model: config.gpt.model, maxToken: config.gpt.maxToken, })
  )
  const result = await chatContext?.send({ role: "user", content: message, })
  if (typeof result === "string") {
    if (useBalance) {
      userRepo.update({ chat_balance: (user?.chat_balance ?? 0) - 1, }, ctx.state.user.phone)
    }
    ctx.body = { code: 200, message: "成功", data: { reply: result, }, }
  } else {
    logger.error(`[CHAT] failed to call openai: ${JSON.stringify(result)}`)
    return ctx.body = { code: 500, message: "失败", data: null, }
  }
}))