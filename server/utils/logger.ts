import chalk from 'chalk'
export const logger = {
  info: (msg: string) => {

    console.log(`${chalk.bgBlueBright('[Info]')}[${new Date().toLocaleString()}] ${msg}`)
  },
  error: (msg: string) => {
    console.log(`${chalk.bgRedBright('[Error]')}[${new Date().toLocaleString()}] ${msg}`)
  }
}