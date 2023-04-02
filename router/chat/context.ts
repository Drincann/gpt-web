import config from "../../config.js";
import { createChatContext } from "../../services/ChatContext.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { logger } from "../../utils/logger.js";
import { parseBody } from "../../utils/parseBody.js";

export const contextHandler = errorHandler(parseBody(async (ctx, next) => {
  logger.info(`[CHAT] contextHandler: ${JSON.stringify({ phone: ctx.state.user.phone })}`)
  let chatContext = ctx.chatStorage.get(ctx.state.user.phone)
  if (!chatContext) {
    logger.info(`[CHAT] create new chat context for ${ctx.state.user.phone}`)
    chatContext = ctx.chatStorage.set(
      ctx.state.user.phone,
      createChatContext({ secret: config.gpt.secret, maxToken: config.gpt.maxToken, model: config.gpt.model, })
    );
  }
  ctx.body = { code: 200, message: "成功", data: { messages: chatContext.getMessages() } }
}))