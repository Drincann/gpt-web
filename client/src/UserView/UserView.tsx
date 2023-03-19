import { useEffect, useState } from 'react'
import { checkLogin } from '../api'
import './UserView.less'
import { Chat } from './Chat'
import { Header } from './Header'


export const UserView = () => {
  const [loginState, setLoginState] = useState<boolean>(false)
  useEffect(() => {
    checkLogin().then(isLogin => setLoginState(isLogin))
  }, [])

  return (
    <div id="user-root">
      <Header isLogin={loginState} setIsLogin={setLoginState} />
      <Chat isLogin={loginState} />
    </div>
  )
}
