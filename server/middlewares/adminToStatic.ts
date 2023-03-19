import Koa from 'koa'
export const adminToStatic = async (ctx: Koa.Context, next: () => Promise<void>) => {
  // /admin to static file index.html
  if (ctx.path.startsWith('/admin')) {
    ctx.path = '/index.html'
  }
  await next()
}
