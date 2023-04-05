import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChatContext, getMessageContext, sendMessage } from "../api";
import { Messages } from "./components/Messages/Messages";
import { Sender } from "./components/Sender/Sender";
import './Chat.less'

const isAsyncIterable = (obj: any): obj is AsyncIterable<any> => {
  return obj[Symbol.asyncIterator] !== undefined
}

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

          if (isAsyncIterable(result)) {
            const currentMessages = { role: 'assistant' as const, content: '' }
            setMessages(messages => [...messages, currentMessages])
            for await (const content of result) {
              currentMessages.content += content
              setMessages(messages => {
                const newMessages = [...messages]
                newMessages[newMessages.length - 1] = currentMessages
                return newMessages
              })
            }
            return
          }
          setMessages(messages => [...messages, { role: 'assistant', content: result.data.reply }])
        } finally {
          setLoading(false)
        }
      }} />
    </div>
  );
}
