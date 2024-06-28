"use client";

import Message from "@/components/Message";
import { ChatList } from "@/models/ChatList";
import { ChatMsg } from "@/models/ChatMsg";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

export default function Chat({ params }: { params: { chatId: string } }) {

  const [messageList, setMessageList] = useState([] as ChatMsg[]);
  const [userInput, setUserInput] = useState('');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8080/messagelist?chatid=${params.chatId}`);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}: ${res.statusText}`)
        }
        const messageList = await res.json();
        console.log(messageList);
        setMessageList(messageList);
      } catch (error) {
        console.error('Error while getting messages', error);
      }
    }

    fetchData();
  }, [params.chatId]);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:8080/chat');

    socketRef.current.onopen = () => {
      console.log('Socket connection opened');
    }

    socketRef.current.onmessage = (event: MessageEvent<{ message: string }>) => {
      const newMessage = event.data;
      console.log(newMessage);
    }

    socketRef.current.onclose = () => {
      console.log('websocket connectio nclosed')
    }

    return () => {
      socketRef.current?.close();
    }
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newChatMsg: ChatMsg = {
      message: userInput,
      userId: 'vince1',
      role: 'self',
      userName: 'Vince',
      messageId: 'fjlkwe'
    };
    socketRef.current?.send(userInput);
    setMessageList([...messageList, newChatMsg]);
  };

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value)
    console.log(userInput)
  }

  return (
    <div>
      <Link href="/chats">Back to convo List</Link>
      {messageList.map((e) => (
        <Message message={e} key={e.messageId}></Message>
      ))}

      <form method="post" onSubmit={handleSubmit}>
        <label>
          Chat Message:
          <input name="chatMsg" value={userInput} onChange={onChangeHandler} className="bg-slate-800"></input>
        </label>
        <button role="submit">Submit</button>
      </form>
    </div>
  );
}
