"use client";

import { Message, WebsocketServerResponse } from '@/models/models';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function GlobalChat() {
  const [userInput, setUserInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');
  const [userName, setUserName] = useState('Anon');
  const [messages, setMessages] = useState<Message[]>([]);

  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io('http://localhost:8080');
    socket.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
    })

    socket.current.on('message', (data: WebsocketServerResponse) => {
      if (data.message) {
        setMessages([...messages, { ...data.message }])
      }
    })

    socket.current.on('error', (err: WebsocketServerResponse) => {
      console.error('Error from server: ', err)
    })

    return () => {
      socket.current?.disconnect()
    }
  }, [])

  const handleSendMessage = () => {
    const messageObject: Message = {
      userId: userName,
      message: userInput,
    }
    setMessages([...messages, messageObject])
    socket.current?.emit('message', messageObject)
  }

  const handleSetUserNameClick = () => {
    setUserName(userNameInput);
  }

  return (
    <div>
      <p>Username: {userName}</p>
      <ul>
        {messages.map((message, index) =>
          <li key={index}>
            <span>{message.userId}:</span>
            <span> {message.message}</span>
          </li>)}
      </ul>
      <div className='flex flex-col'>
        <input
          type='text'
          className='bg-slate-700 mb-2'
          placeholder='Message'
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
        ></input>
        {userName === 'Anon' ?
          <input
            type='text'
            className='bg-slate-700'
            placeholder='User Name'
            value={userNameInput}
            onChange={(event) => setUserNameInput(event.target.value)}
          ></input> :
          null
        }
      </div>
      {userName === 'Anon' ?
        <button onClick={() => handleSetUserNameClick()}>Set Username</button> :
        null
      }
      <button onClick={() => handleSendMessage()}>Send</button>
    </div>
  )
}
