export const generateCode = (length: number) => {
  const code = Math.random().toString().slice(2, 2 + length)
  return code
}