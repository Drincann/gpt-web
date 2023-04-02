/**
 * @see https://stackoverflow.com/questions/6921588/is-it-possible-to-reflect-the-arguments-of-a-javascript-function
 */
export const parseParams = (f: Function): string[] =>
  f.toString()
    .replace(/[\r\n\s]+/g, ' ')
    .match(/(?:async\s*\w*)(?:function\s*\w*)?\s*(?:\((.*?)\)|([^\s]+))/)
    ?.slice(1, 3)
    .join('')
    .split(/\s*,\s*/) ?? [];
