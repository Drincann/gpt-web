import { userRepo } from "../../db/index.js";
import { logger } from "../../utils/logger.js";
import { parseBody } from "../../utils/parseBody.js";

export const checkHandler = parseBody(async (ctx, next) => {
  if ((await userRepo.find({ conditions: { phone: ctx.state.user.phone }, limit: 1, offset: 0 })).length >= 1) {
    logger.info(`[USER] ${ctx.state.user.phone} check success`);
    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: 'ok',
      data: null
    };
  } else {
    logger.info(`[USER] ${ctx.state.user.phone} check failed`);
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: 'Unauthorized',
      data: null
    };
  }
});