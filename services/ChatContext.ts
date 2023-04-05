import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai"
import { MassageContext } from "./MessageContext.js"
import { Readable, Stream } from "node:stream"
import fetch from 'node-fetch'
import { createParser } from "eventsource-parser"
import config from "../config.js"

const OPENAI_URL = "api.openai.com"
const DEFAULT_PROTOCOL = "https"
const CHAT_PATH = '/v1/chat/completions'

export interface ChatContext {
  send(msg: ChatCompletionRequestMessage, retry?: number, isRetry?: boolean): Promise<string>
  stream(msg: ChatCompletionRequestMessage): Promise<Stream>
  getMessages(): ChatCompletionRequestMessage[]
  resetConversition(): Promise<void>
}

export interface CreateContextOptions {
  secret: string
  model?: string
  messages?: ChatCompletionRequestMessage[]
  maxToken?: number
}

export const createChatContext = ({
  secret, model, messages, maxToken = 4096,
}: CreateContextOptions): ChatContext => {
  const openai = new OpenAIApi(new Configuration({ apiKey: secret }));
  let msgContext = new MassageContext(messages ?? [], maxToken)
  return {
    async stream(msg: ChatCompletionRequestMessage): Promise<Stream> {
      msgContext.push(msg)
      const reply = { role: 'assistant' as const, content: '' }
      const res = await fetch(`${DEFAULT_PROTOCOL}://${OPENAI_URL}${CHAT_PATH}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.gpt.secret}`,
        },
        method: 'POST',
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: msgContext.getMessagesClone(),
          stream: true,
        })
      });

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const stream = new Readable({ read(size) { } });

      const parser = createParser((event: any) => {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            stream.push(null)
            msgContext.push(reply)
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            if (typeof text === 'string') reply.content += text
            stream.push(queue)
          } catch (e) {
            stream.emit('error', e)
          }
        }
      });
      (async () => {
        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      })()
      return stream
    },
    async send(msg: ChatCompletionRequestMessage, retry: number = 2, isRetry: boolean = false): Promise<string> {
      try {
        if (!isRetry) msgContext.push(msg)
        const res = await openai.createChatCompletion({
          model: model ?? 'gpt-3.5-turbo',
          messages: msgContext.getMessagesClone(),
        })

        const { message } = res.data.choices[0]
        msgContext.push({ role: 'assistant', content: message?.content ?? '' })
        return message?.content ?? ''
      } catch (e) {
        if (retry > 0 && (e as any)?.response?.status === 429) {
          return this.send(msg, retry - 1, true)
        }
        msgContext.pop()
        throw e
      }
    },
    async resetConversition(): Promise<void> { msgContext.reset() },
    getMessages(): ChatCompletionRequestMessage[] { return msgContext.getMessagesClone() },
  }
}