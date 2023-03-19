import mysql from 'mysql2/promise'
import config from '../config.js'
import { logger } from '../utils/logger.js'

const conn = await mysql.createConnection({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
})
/*
CREATE TABLE `user`(
  `id` int NOT NULL AUTO_INCREMENT COMMENT '自增 id',
  `name` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '用户名',
  `phone` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '手机号',
  `expire` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '过期时间',
  `chat_balance` INT NOT NULL DEFAULT 0 COMMENT '聊天余额',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`) USING BTREE
) ENGINE = InnoDB COMMENT '用户表',
COLLATE = utf8_bin;
 */

export interface UserDTO {
  id: number
  name: string
  phone: string
  expire: Date
  chat_balance: number
  create_time: Date
  update_time: Date
}

const buildWhere = (keys: string[]) => {
  return ` where ${keys.map(key => `\`${key}\` = ?`).join(' and ')}`
}

const buildFieldsAndValues = (keys: string[]) => {
  return `(${keys.map(key => `\`${key}\``).join(', ')}) values (${keys.map(() => '?').join(', ')})`
}

type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

export const userRepo = {
  async find({ conditions, limit, offset }: { conditions: Partial<UserDTO>, limit: number, offset: number }): Promise<Partial<UserDTO>[]> {
    const sql = `select * from \`user\` ${buildWhere(Object.keys(conditions))} ${limit && offset ? 'limit ?' : ''} ${limit && offset ? 'offset ?' : ''}`
    logger.info(`[DB] sql: ${sql}, values: ${JSON.stringify([...Object.values(conditions), limit, offset])}`)
    const [results] = await conn.query(sql, [...Object.values(conditions), limit, offset])
    return results as UserDTO[]
  },

  async findByPhoneNotExact(phone: string): Promise<Partial<UserDTO>[]> {
    const sql = `select * from \`user\` where phone like ?`
    logger.info(`[DB] sql: ${sql}, values: ${JSON.stringify([`%${phone}%`])}`)
    const [results] = await conn.query(sql, [`%${phone}%`])
    return results as UserDTO[]
  },

  async insert(user: Pick<UserDTO, 'name' | 'phone' | 'expire' | 'chat_balance'>): Promise<boolean> {
    const sql = `insert into \`user\` ${buildFieldsAndValues(Object.keys(user))}`
    logger.info(`[DB] sql: ${sql}, values: ${JSON.stringify(Object.values(user))}`)
    const [{ insertId, affectedRows } = { insertId: undefined, affectedRows: undefined }]
      = await conn.query(sql, Object.values(user)) as any

    if (!insertId || !affectedRows) {
      logger.error(`[DB] userRepo.insert failed: ${JSON.stringify(user)}`)
      return false
    }
    return true
  },

  async update(user: Partial<Pick<UserDTO, 'name' | 'expire' | 'chat_balance'>>, phone: string): Promise<boolean> {
    const sql = `update \`user\` set ${Object.keys(user).map(key => `\`${key}\` = ?`).join(', ')} ${buildWhere(['phone'])}`
    logger.info(`[DB] sql: ${sql}, values: ${JSON.stringify([...Object.values(user), phone])}`)
    const [{ affectedRows } = { affectedRows: undefined }] = await conn.query(sql, [...Object.values(user), phone]) as any

    if (!affectedRows) {
      logger.error(`[DB] userRepo.update failed: ${JSON.stringify(user)}`)
      return false
    }
    return true
  }
}