import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChatContext, getMessageContext, sendMessage } from "../api";
import { Messages } from "./components/Messages/Messages";
import { Sender } from "./components/Sender/Sender";
import './Chat.less'

export const Chat: React.FC<{ isLogin: boolean }> = props => {
  const [loading, setLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<ChatContext>([])
  useEffect(() => {
    if (!props.isLogin) return
    getMessageContext().then(res => {
      setMessages(res.data.messages as any)
    })
  }, [props.isLogin])
  return (
    <div className='chat'>
      <Messages messages={messages} />
      <Sender loading={loading} onSend={async (msg: string) => {
        try {
          setLoading(true)
          setMessages(messages => [...messages, { role: 'user', content: msg }])
          const result = await sendMessage(msg)
          setMessages(messages => [...messages, { role: 'assistant', content: result.data.reply }])
        } finally {
          setLoading(false)
        }
      }} />
    </div>
  );
}
