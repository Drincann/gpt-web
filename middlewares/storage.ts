import { createStorage } from "../utils/storage.js"
import Koa from "koa"
import { ChatContext } from '../services/ChatContext.js'

declare module "koa" {
  interface DefaultContext {
    chatStorage: ReturnType<typeof createStorage<ChatContext>>
    codeStorage: ReturnType<typeof createStorage<{ code: string }>>
    ipSendCodeExpireStorage: ReturnType<typeof createStorage<boolean>>
    ipSendCodeButNotVerifyPerDayStorage: ReturnType<typeof createStorage<{ cnt: number }>>
  }
}

declare module "./../types" {
  interface AppContext extends Koa.DefaultContext {
    chatStorage: ReturnType<typeof createStorage<ChatContext>>
    codeStorage: ReturnType<typeof createStorage<{ code: string }>>
    ipSendCodeExpireStorage: ReturnType<typeof createStorage<boolean>>
    ipSendCodeButNotVerifyPerDayStorage: ReturnType<typeof createStorage<{ cnt: number }>>
  }
}

export const setChatStorage = (expire: number) => {
  const storage = createStorage<ChatContext>(expire)
  return async (ctx: Koa.Context, next?: () => Promise<any>) => {
    ctx.chatStorage = storage
    await next?.()
  }
}

export const setCodeStorage = (expire: number) => {
  const storage = createStorage<{ code: string }>(expire)
  storage.set("18531024352", { code: "1234", })
  return async (ctx: Koa.Context, next?: () => Promise<any>) => {
    ctx.codeStorage = storage
    await next?.()
  }
}

export const setIPSendCodeExpireStorage = (expire: number) => {
  const storage = createStorage<boolean>(expire)
  return async (ctx: Koa.Context, next?: () => Promise<any>) => {
    ctx.ipSendCodeExpireStorage = storage
    await next?.()
  }
}

export const setIPSendCodeButNotVerifyPerDayStorage = (expire: number) => {
  const storage = createStorage<{ cnt: number }>(expire)
  return async (ctx: Koa.Context, next?: () => Promise<any>) => {
    ctx.ipSendCodeButNotVerifyPerDayStorage = storage
    await next?.()
  }
}