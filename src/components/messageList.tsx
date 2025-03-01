import { useEffect, useRef } from 'react'
import { Message } from './chat'

export function MessageList({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    if (!messagesEndRef.current) return
    messagesEndRef.current.scrollIntoView(true)
  }, [messages.length])

  return (
      <div className='space-y-4'>
        {messages.map((message, index) => (
          <div
            key={message.senderId}
            ref={index + 1 === messages.length ? messagesEndRef : null}
          >
            {message.message}
            </div>
        ))}
      </div>
  )
}