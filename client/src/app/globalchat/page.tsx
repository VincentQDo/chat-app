"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function GlobalChat() {
  const [userInput, setUserInput] = useState('');

  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io('http://localhost:8080');
    socket.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
    })

    return () => {
      socket.current?.disconnect()
    }
  }, [])

  const sendMessage = () => {
    socket.current?.emit('message', {
      userid: 'userTest',
      message: userInput
    })
  }

  return <div>
    <input type="text" className="bg-slate-700" value={userInput} onChange={(event) => setUserInput(event.target.value)}></input>
    <button onClick={() => sendMessage()}>Send</button>
  </div>
}
