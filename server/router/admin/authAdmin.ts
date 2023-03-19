import config from "../../config";
import { logger } from "../../utils/logger";
import { parseBody } from "../../utils/parseBody";

export const authAdminHandler = parseBody(async (ctx, next) => {
  if (!config.admin.phoneList.includes(ctx.state.user.phone)) {
    logger.error(`[ADMIN] ${ctx.state.user.phone} is not admin`)
    ctx.throw(403, 'You are not admin.');
  }
  await next();
})