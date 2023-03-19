export const generateCode = (length: number) => {
  const code = Math.random().toString(36).slice(2, length)
  return code
}