export const isPhone = (phone: string): boolean => {
  return /^1[3456789]\d{9}$/.test(phone);
}