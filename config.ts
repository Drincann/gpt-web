export default {
  port: 80,

  mysql: {
    host: 'host',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'database',
  },

  gpt: {
    memoryExpire: 1000 * 60 * 60 * 24 * 3, // 3 days
    secret: 's',
    maxToken: 4096,
    model: 'gpt-3.5-turbo',
    maxLengthInSingleRequest: 1024,
  },

  codeService: {
    codeExpire: 1000 * 60 * 10, // 10 minutes
    ipSendCodeExpire: 1000 * 60, // 1 minute
    ipSendButNotVerifyLimitPerday: 50,
    ssm: {
      app_id: 'app_id',
      secret: 's',
      sign: 'sign',
      template_id: 'ST_2020101100000007',
    },
    tencentCloud: {
      secretId: 'secretId'
      secretKey: 'secretKey',
      SignName: 'sign',
      TemplateId: '123456',
      SmsSdkAppId: '123456',
    }
  },

  vip: {
    defaultBalance: 3,
    defaultDate: () => new Date()
  },

  jwt: {
    secret: 'jwt secret',
  },

  admin: {
    phoneList: ["11122223333",]
  }
}