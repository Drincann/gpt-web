import config from "../../config.js";
import { logger } from "../../utils/logger.js";
import { parseBody } from "../../utils/parseBody.js";

export const authAdminHandler = parseBody(async (ctx, next) => {
  if (!config.admin.phoneList.includes(ctx.state.user.phone)) {
    logger.error(`[ADMIN] ${ctx.state.user.phone} is not admin`)
    ctx.throw(403, 'You are not admin.');
  }
  await next();
})