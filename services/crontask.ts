import { logger } from "../utils/logger.js"
import cron from 'cron'
import { conn } from '../db/index.js'
export const threeFreeTalkEveryday = (stopRef: { stop: boolean },) => {
  const recharge = async () => {
    const sql = `update \`user\` set chat_balance = 3 where chat_balance < 3`
    const result = await conn.query(sql)
    logger.info(`[CRONTASK] [THREEFREETALK] recharge ${(result?.[0] as any)?.affectedRows} users`)
  }
  recharge()
  new cron.CronJob('0 0 0 * * *', async () => {
    if (stopRef.stop) return logger.info(`[CRONTASK] [THREEFREETALK] stop`)
    recharge()
  }).start()
}