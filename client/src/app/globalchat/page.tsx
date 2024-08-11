"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function GlobalChat() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io('http://localhost:8080');
    console.log('creating new socket connection')
    socket.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
    })

    socket.current.on('message', (data) => {
      console.log('Message from server: ', data)
    })

    socket.current.on('error', (err) => {
      console.error('Error from server: ', err)
    })

    return () => {
      socket.current?.disconnect()
    }
  }, [])

  const sendMessage = () => {
    setMessages([...messages, userInput])
    socket.current?.emit('message', {
      userid: 'userTest',
      message: userInput
    })
  }

  return <div>
    <ul>
      {messages.map((message, index) => <li key={index}>{message}</li>)}
    </ul>
    <input
      type="text"
      className="bg-slate-700" value={userInput} onChange={(event) => setUserInput(event.target.value)}></input>
    <button onClick={() => sendMessage()}>Send</button>
  </div>
}
