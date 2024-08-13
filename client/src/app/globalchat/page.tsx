"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message, WebsocketServerResponse } from '@/models/models';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function GlobalChat() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [userInput, setUserInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');
  const [userName, setUserName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    setUserName(localStorage.getItem('userName') ?? '');
    if (!apiUrl) {
      return;
    }
    socket.current = io(apiUrl);
    socket.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
    })

    socket.current.on('message', (data: WebsocketServerResponse) => {
      if (data.message) {
        setMessages((prevMessages) => [...prevMessages, { ...data.message! }])
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
    setUserInput('')
    socket.current?.emit('message', messageObject)
  }

  const handleSetUserNameClick = () => {
    setUserName(userNameInput);
    localStorage.setItem('userName', userNameInput);
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
      <div className='flex w-full max-w-sm items-center space-x-2'>
        {userName === 'Anon' ?
          <>
            <Input name='username' type='text' placeholder='Username' value={userNameInput} onChange={(event) => setUserNameInput(event.target.value)}></Input>
            <Button onClick={() => handleSetUserNameClick()}>Set Username</Button>
          </> :
          <>
            <Input name='message' type='text' placeholder='Message' value={userInput} onChange={(event) => setUserInput(event.target.value)}></Input>
            <Button onClick={() => handleSendMessage()}>Send</Button>
          </>
        }
      </div>
    </div>
  )
}
