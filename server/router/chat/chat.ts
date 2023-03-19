import config from "../../config";
import { errorHandler } from "../../utils/errorHandler"
import { parseBody } from "../../utils/parseBody"
import { userRepo } from "../../db"
import { createChatContext } from "../../services/ChatContext";
import { logger } from "../../utils/logger";

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