import './Header.less';
import { Button, Modal, Form, Input, Select, Row, Col, message } from 'antd';
import { useState } from 'react';
import { getCode, login } from '../api';
export const Header: React.FC<{ isLogin: boolean, setIsLogin: (bool: boolean) => void }> = props => {
  const [loginModalVisible, setLoginModalVisible] = useState<boolean>(false)
  const [codeSendTimer, setCodeSendTimer] = useState<number>(0)
  const [form] = Form.useForm()

  return (
    <header className='header'>
      <div className='header__title'>ChatGPT</div>
      {props.isLogin ?
        <>已登录</>
        :
        <Button type='dashed' ghost size='large' className='header__login-btn'
          onClick={() => {
            setLoginModalVisible(true)
          }}
        >登录</Button>
      }
      <Modal
        title='登录'
        open={loginModalVisible}
        onCancel={() => { setLoginModalVisible(false) }}
        footer={null}
      >
        <Form form={form}>
          <Form.Item name="phone" label="手机号"
          >
            <Input style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="验证码">
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="captcha" >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Button type='primary' loading={codeSendTimer > 0}
                  onClick={async () => {
                    if (codeSendTimer > 0) return
                    if (!/^1[3456789]\d{9}$/.test(form.getFieldValue('phone'))) {
                      message.error('手机号格式错误')
                      return
                    }
                    await getCode(form.getFieldValue('phone'))
                    message.success('验证码已发送')
                    setCodeSendTimer(60)
                    const timer = setInterval(() => {
                      setCodeSendTimer(codeSendTimer => {
                        if (codeSendTimer > 0) {
                          return codeSendTimer - 1
                        } else {
                          clearInterval(timer)
                          return 0
                        }
                      })
                    }, 1000)
                  }}>{codeSendTimer > 0 ? `${codeSendTimer} 秒后重发` : '获取验证码'}</Button>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item>
            <Button type="primary" style={{ width: '100%' }}
              onClick={async () => {
                if (!/^1[3456789]\d{9}$/.test(form.getFieldValue('phone'))) {
                  message.error('手机号格式错误')
                  return
                }
                if (!/^\d{4}$/.test(form.getFieldValue('captcha'))) {
                  message.error('验证码格式错误')
                  return
                }
                const result = await login(form.getFieldValue('phone'), form.getFieldValue('captcha'))
                localStorage.setItem('token', result.data.token)
                props.setIsLogin(true)
                setLoginModalVisible(false)
              }}
            > 登录 </Button>
          </Form.Item>
        </Form>
      </Modal>
    </header >
  );
};

