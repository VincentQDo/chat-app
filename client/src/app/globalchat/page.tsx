"use client";

import { Message, WebsocketServerResponse } from '@/models/models';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function GlobalChat() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io('http://localhost:8080');
    console.log('creating new socket connection')
    socket.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
    })

    socket.current.on('message', (data: WebsocketServerResponse) => {
      console.log('data from server', data)
      setMessages([...messages, { ...data.message }])
    })

    socket.current.on('error', (err) => {
      console.error('Error from server: ', err)
    })

    return () => {
      socket.current?.disconnect()
    }
  }, [])

  const sendMessage = () => {
    const messageObject: Message = {
      userId: 'Test user',
      message: userInput,
    }
    setMessages([...messages, messageObject])
    socket.current?.emit('message', messageObject)
  }

  return (
    <div>
      <ul>
        {messages.map((message, index) =>
          <li key={index}>
            <span>{message.userId}:</span>
            <span> {message.message}</span>
          </li>)}
      </ul>
      <input
        type="text"
        className="bg-slate-700" value={userInput} onChange={(event) => setUserInput(event.target.value)}></input>
      <button onClick={() => sendMessage()}>Send</button>
    </div>
  )
}
