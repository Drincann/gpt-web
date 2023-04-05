import axios from 'axios'
import { message as MessageUI } from 'antd'
type GPTResponse<T> = {
  data: T, message: string, code: 200 | 400 | 401 | 403 | 404 | 500
}

export type ChatContext = { role: 'user' | 'assistant', content: string }[]

export const login = async (phone: string, code: string): Promise<GPTResponse<{ token: string }>> => {
  try {
    const result = (await axios.post('/api/login', { phone, code, })).data
    if (result.code !== 200) {
      throw new Error(result.message ?? '登录失败')

    }
    return result
  } catch (err) {
    MessageUI.error((err as any)?.message ?? '登录失败')
    throw err
  }

}

export const getCode = async (phone: string): Promise<GPTResponse<null>> => {
  try {
    const result = (await axios.get('/api/code', { params: { phone } })).data
    if (result.code !== 200) {
      throw new Error(result.message ?? '验证码获取失败')
    }
    return result
  } catch (err) {
    MessageUI.error((err as any)?.message ?? '验证码获取失败')
    throw err
  }
}

const createStreamIterator = (stream: ReadableStreamDefaultReader): AsyncIterable<string> => {
  return {
    [Symbol.asyncIterator]() {
      return {
        next: async () => {
          const { value, done } = await stream.read();
          if (done) return { done: true, value: undefined }
          return { done: false, value: new TextDecoder().decode(value) }
        }
      }
    },
  }
}



export const sendMessage = async (message: string): Promise<GPTResponse<{ reply: string }> | AsyncIterable<string>> => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('登录已过期，请重新登录')
    const result = (await fetch('/api/chat-stream', {
      method: 'POST',
      body: JSON.stringify({ message }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }))
    if (result.body == null) throw new Error('发送失败')
    const reader = result.body.getReader()
    if (reader != null) {
      return createStreamIterator(reader)
    }

    const response = await result.json()

    if (response.code === 401) {
      throw new Error('登录已过期，请重新登录')
    }
    if (response.code === 402) {
      throw new Error('余额不足，请充值')
    }
    if (response.code !== 200 || typeof response.data.reply !== 'string') {
      throw new Error(response.message ?? '发送失败')
    }
    return response
  } catch (err) {
    if ((err as any)?.response?.status === 401) {
      MessageUI.error('登录已过期，请重新登录')
      throw err
    }
    MessageUI.error((err as any)?.message ?? '发送失败')
    throw err
  }
}

export const getMessageContext = async (): Promise<GPTResponse<{ messages: ChatContext }>> => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('登录已过期，请重新登录')
    const result = (await axios.get('/api/context', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })).data
    if (result.code !== 200) {
      throw new Error(result.message ?? '历史记录获取失败')
    }
    return result
  } catch (err) {
    if ((err as any)?.response?.status === 401) {
      MessageUI.error('登录已过期，请重新登录')
      throw err
    }
    MessageUI.error((err as any)?.message ?? '历史记录获取失败')
    throw err
  }
}

export const checkLogin = async (): Promise<boolean> => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('登录已过期，请重新登录')
  try {
    const result = (await axios.get('/api/check', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })).data
    if (result.code !== 200) {
      return false
    }
    return true
  } catch (err) {
    if ((err as any)?.response?.status === 401) {
      return false
    }
  }
  return false
}

// admin
export const recharge = async (phone: string, amount: number): Promise<GPTResponse<null>> => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('登录已过期，请重新登录')
  try {
    const result = (await axios.get('/api/recharge', { params: { phone, amount, }, headers: { Authorization: `Bearer ${token}` } })).data
    if (result.code !== 200) {
      throw new Error(result.message ?? '充值失败')
    }
    return result
  } catch (err) {
    MessageUI.error((err as any)?.message ?? '充值失败')
    throw err
  }
}
export type UserDuck = { phone: string, chat_balance: number, expire: Date, id: number }

export const listUsers = async (phone: string): Promise<GPTResponse<{ list: UserDuck[] }>> => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('登录已过期，请重新登录')
  try {
    const result = (await axios.get('/api/list', { params: { phone }, headers: { Authorization: `Bearer ${token}` } })).data
    if (result.code !== 200) {
      throw new Error(result.message ?? '获取用户列表失败')
    }
    return result
  } catch (err) {

    MessageUI.error((err as any)?.message ?? '获取用户列表失败')
    throw err
  }
}

export const expire = async (phone: string, days: number): Promise<GPTResponse<null>> => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('登录已过期，请重新登录')
  try {
    const result = (await axios.get('/api/expire', { params: { phone, days }, headers: { Authorization: `Bearer ${token}` } })).data
    if (result.code !== 200) {
      throw new Error(result.message ?? '设置过期时间失败')
    }
    return result
  } catch (err) {
    MessageUI.error((err as any)?.message ?? '设置过期时间失败')
    throw err
  }
}