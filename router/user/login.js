import { parseBody } from '../../utils/parseBody.js';
import { userRepo } from '../../db/index.js';
import config from '../../config.js';
import { isPhone } from '../../utils/isPhone.js';
import { errorHandler } from '../../utils/errorHandler.js';
import jwt from 'jsonwebtoken';
import { logger } from '../../utils/logger.js';
export const loginHandler = errorHandler(parseBody(async (ctx, next, phone, code) => {
    var _a, _b;
    logger.info(`[USER] loginHandler: ${JSON.stringify({ phone, code })}`);
    // 参数校验
    if (typeof phone !== 'string' || typeof code !== 'string' || !isPhone(phone)) {
        ctx.body = { code: 400, message: '参数错误', };
        return;
    }
    // 验证码校验
    const { codeStorage } = ctx;
    const codeStoraged = codeStorage.get(phone);
    if ((codeStoraged === null || codeStoraged === void 0 ? void 0 : codeStoraged.code) !== code) {
        logger.info(`[USER] ${ctx.ip} login failed: code not match`);
        ctx.body = { code: 401, message: '验证码已过期，请重新获取', };
        return;
    }
    // 校验用户
    const [user] = await userRepo.find({ conditions: { phone, }, limit: 1, offset: 0 });
    if (!user) {
        logger.info(`[USER] ${ctx.ip} create new user: ${phone}`);
        // 自动注册
        await userRepo.insert({
            phone,
            chat_balance: config.vip.defaultBalance,
            expire: config.vip.defaultDate(),
            name: phone,
        });
    }
    const token = await new Promise(resolve => jwt.sign({ phone, }, config.jwt.secret, { expiresIn: '30d', }, (_, token) => resolve(token)));
    if (!token) {
        logger.error(`[USER] ${ctx.ip} login failed: jwt sign failed`);
        return ctx.body = { code: 500, message: '服务器错误', };
    }
    logger.info(`[USER] ${ctx.ip} login success: ${phone}`);
    ctx.ipSendCodeButNotVerifyPerDayStorage.set(ctx.ip, { cnt: ((_b = (_a = ctx.ipSendCodeButNotVerifyPerDayStorage.get(ctx.ip)) === null || _a === void 0 ? void 0 : _a.cnt) !== null && _b !== void 0 ? _b : 0) - 1 });
    ctx.body = { code: 200, message: '登录成功', data: { token }, };
}));
