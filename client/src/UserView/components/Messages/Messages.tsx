import { Avatar, List } from "antd"
import { UserOutlined } from '@ant-design/icons';
import { useEffect, useRef } from "react"
import { ChatContext } from "../../../api"
import { GPTSvg } from "./GPTSvg"
import './Messages.less'

export interface MessagesProps {
  messages: ChatContext
}
export const Messages: React.FC<MessagesProps> = props => {
  useEffect(() => {
    const messagesBox = document.querySelector('.messages')
    if (messagesBox) {
      messagesBox.scrollTop = messagesBox.scrollHeight
    }
  }, [props.messages])

  return (
    <div className='messages'>
      <List
        itemLayout="horizontal"
        dataSource={props.messages}
        renderItem={(item, index) => (
          <List.Item
            style={{
              backgroundColor: item.role === 'assistant' ? '#444653' : '#343540',
              color: 'white',
            }}>
            <List.Item.Meta
              style={{
                paddingLeft: 10,
              }}
              avatar={item.role === 'assistant' ? <Avatar size={64} icon={<GPTSvg size={64} />} /> : <Avatar size={64} icon={<UserOutlined />} />}
              title={<a href="https://ant.design">{item.role}</a>}
              description={<>{item.content.split('\n').map((item, index) => <p key={index}>{item}</p>)}</>}
            />
          </List.Item>
        )}
      />
    </div>
  )
}