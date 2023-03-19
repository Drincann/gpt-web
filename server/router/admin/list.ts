import { userRepo } from "../../db";
import { logger } from "../../utils/logger";
import { parseBody } from "../../utils/parseBody";

export const listHandler = parseBody(async (ctx, next, phone: string,) => {
  logger.info(`[ADMIN] listHandler: ${JSON.stringify({ phone })}`)
  if (!phone) {
    return ctx.body = {
      data: { list: [] },
      code: 400,
      message: 'Invalid phone',
    }
  }

  const users = await userRepo.findByPhoneNotExact(phone);
  ctx.body = {
    data: { list: users },
    code: 200,
    message: 'OK',
  };
})