import { Button } from "antd"
import TextArea from "antd/es/input/TextArea"
import { useState } from "react"
import './Sender.less'

export interface SenderProps {
  loading: boolean
  onSend: (msg: string) => Promise<void>
}

export const Sender: React.FC<SenderProps> = props => {
  const [message, setMessage] = useState<string>('')
  return (
    <div className="sender">
      <TextArea
        value={message}
        onChange={e => {
          setMessage(e.target.value)
        }}
        className="sender__textarea"
        placeholder="输入消息"
        onPressEnter={(e) => {
          if (props.loading) return
          if (message.trim() === '') return
          e.preventDefault()
          setTimeout(() => {
            setMessage('')
          });
          props.onSend(message)

        }}
        autoSize={{ minRows: 2, maxRows: 10 }}
      />
      <Button
        className="sender__button"
        type="primary"
        loading={props.loading}
        onClick={(e) => {
          if (props.loading) return
          if (message.trim() === '') return
          setMessage('')
          props.onSend(message)
        }}
      >发送</Button>
    </div>
  )
}