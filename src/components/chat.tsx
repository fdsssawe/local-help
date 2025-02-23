"use client"

import React, { useEffect, useState } from 'react';
import { api } from '~/trpc/react'; // Ensure correct import
import { listenForMessages } from '~/lib/supabase'; // Make sure this is correctly set up for real-time updates

type Message = {
  senderId: string;
  receiverId: string;
  message: string;
};

const ChatWindow: React.FC<{ userId: string; otherUserId: string }> = ({ userId, otherUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const utils = api.useUtils();

  // Fetch existing messages
  const { data, isLoading, error } = api.chat.getMessages.useQuery({ userId });

  useEffect(() => {
    if (data) {
      setMessages(data);
    }
  }, [data]);

  // Listen for new messages in real time
  useEffect(() => {
    const unsubscribe = listenForMessages(userId, (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, [userId]);

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: async () => {
      await utils.chat.invalidate();
    },
  });

  const sendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await sendMessageMutation.mutateAsync({ receiverId: otherUserId, message: newMessage });
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {isLoading ? (
          <p>Loading messages...</p>
        ) : error ? (
          <p>Error loading messages: {error.message}</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={msg.senderId === userId ? 'sent' : 'received'}>
              <p>{msg.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;