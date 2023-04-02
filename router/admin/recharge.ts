import { userRepo } from "../../db/index.js";
import { isPhone } from "../../utils/isPhone.js";
import { logger } from "../../utils/logger.js";
import { parseBody } from "../../utils/parseBody.js";

export const rechargeHandler = parseBody(async (ctx, next, phone: string, amount: string) => {
  logger.info(`[ADMIN] rechargeHandler: ${JSON.stringify({ phone, amount })}`)
  if (typeof phone !== 'string' || !isPhone(phone)) {
    return ctx.body = {
      code: 400,
      message: 'Invalid phone',
      data: null,
    }
  }
  const amountNumber = parseInt(amount);
  if (typeof amountNumber !== 'number' || amountNumber < 0) {
    return ctx.body = {
      code: 400,
      message: 'Invalid amount',
      data: null,
    }
  }

  const [user] = await userRepo.find({ conditions: { phone }, limit: 1, offset: 0 });
  if (!user) {
    return ctx.body = {
      code: 400,
      message: 'User not found',
      data: null,
    }
  }

  const newBalance = (user.chat_balance ?? 0) + amountNumber;
  const success = await userRepo.update({ chat_balance: newBalance }, phone);
  if (!success) {
    return ctx.body = {
      code: 500,
      message: 'Internal Server Error',
      data: null,
    }
  } else {
    logger.info(`[ADMIN] ${ctx.state.user.phone} recharge ${phone} ${amountNumber} success`)
    return ctx.body = {
      code: 200,
      message: 'OK',
      data: null,
    }
  }
})