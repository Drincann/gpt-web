import config from '../config.js';
import Sms from '../libs/sendsms.js'

const sms = new Sms();
export const sendCode = async (phone: string, code: string): Promise<boolean> => {
  const result = await fetch('http://api.shansuma.com/gateway.do' + sms.getSendSmsData(
    config.codeService.app_id, config.codeService.secret, config.codeService.sign,
    config.codeService.template_id, phone, code
  ), {
    method: 'GET',
  }).then(v => v.json())

  return result?.data?.code === 0;
}
