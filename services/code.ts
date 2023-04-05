import config from '../config.js';
import Sms from '../libs/sendsms.js'
import { logger } from '../utils/logger.js';
import fetch from 'node-fetch'
import tencentcloud from "tencentcloud-sdk-nodejs-sms"

const sms = new Sms();
export const sendCode = async (phone: string, code: string): Promise<boolean> => {
  const result = await fetch('http://api.shansuma.com/gateway.do' + sms.getSendSmsData(
    config.codeService.ssm.app_id, config.codeService.ssm.secret, config.codeService.ssm.sign,
    config.codeService.ssm.template_id, phone, code
  ), {
    method: 'GET',
  }).then(v => v.json())
  const status: number = (result as any)?.data?.code;
  if (status !== 0) {
    logger.error(`[CODE] sendCode failed: ${JSON.stringify(result)}`)
  }
  return status === 0;
}

export const sendCodeUsingTencentCloud = async (phone: string, code: string): Promise<boolean> => {
  const SmsClient = tencentcloud.sms.v20210111.Client;
  const clientConfig = {
    credential: {
      secretId: config.codeService.tencentCloud.secretId,
      secretKey: config.codeService.tencentCloud.secretKey,
    },
    region: "ap-guangzhou",
    profile: {
      httpProfile: {
        endpoint: "sms.tencentcloudapi.com",
      },
    },
  };

  const client = new SmsClient(clientConfig);
  const params = {
    PhoneNumberSet: [phone],
    SmsSdkAppId: config.codeService.tencentCloud.SmsSdkAppId,
    SignName: config.codeService.tencentCloud.SignName,
    TemplateId: config.codeService.tencentCloud.TemplateId,
    TemplateParamSet: [code]
  };
  return new Promise(resolve => {
    client.SendSms(params).then(
      (data) => {
        resolve(data.SendStatusSet[0].Code === "Ok")
      },
      (err) => {
        logger.error(`[CODE] sendCode using tencent cloud failed: ${JSON.stringify(err)}`)
        resolve(false)
      }
    );
  })
}