import { userRepo } from "../../db/index.js";
import { isPhone } from "../../utils/isPhone.js";
import { logger } from "../../utils/logger.js";
import { parseBody } from "../../utils/parseBody.js";

export const expireHandler = parseBody(async (ctx, next, phone: string, days: string) => {
  logger.info(`[ADMIN] expireHandler: ${JSON.stringify({ phone, days })}`)
  if (typeof phone !== 'string' || !isPhone(phone)) {
    return ctx.body = {
      code: 400,
      message: 'Invalid phone',
    }
  }
  const daysNumber = parseInt(days);
  if (typeof daysNumber !== 'number' || daysNumber < 0) {
    return ctx.body = {
      code: 400,
      message: 'Invalid days',
    }
  }

  const [user] = await userRepo.find({ conditions: { phone }, limit: 1, offset: 0 });
  if (!user) {
    return ctx.body = {
      code: 400,
      message: 'User not found',
    }
  }

  const expire = new Date(user.expire ?? new Date()).getTime() > new Date().getTime() ? new Date(user.expire!) : new Date();
  expire.setDate(expire.getDate() + daysNumber);

  const success = await userRepo.update({ expire }, phone);
  if (!success) {
    return ctx.body = {
      code: 500,
      message: 'Internal Server Error',
    }
  } else {
    logger.info(`[ADMIN] ${ctx.state.user.phone} set ${phone} expire to ${expire} success`)
    return ctx.body = {
      code: 200,
      message: 'OK',
    }
  }
});