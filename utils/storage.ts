export const createStorage = <T>(memoryExpire: number): {
  get: (key: string) => T | undefined
  set: <T1 extends T>(key: string, value: T1) => T1
} => {
  const memory = new Map<string, any>()

  const set = <T1 extends T>(key: string, value: T1): T1 => {
    memory.set(key, value)
    setTimeout(() => memory.delete(key), memoryExpire)
    return value
  }

  const get = (key: string) => {
    return memory.get(key)
  }

  return {
    set,
    get,
  }
}