"use client";

import Message from "@/components/Message";
import { ChatMsg } from "@/models/ChatMsg";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

export default function Chat({ params }: { params: { chatId: string } }) {
  const convoData: ChatMsg[] = [
    {
      userName: "Bob",
      userId: "bob1",
      message: "Hello there",
      role: "other",
      messageId: "slkjerlkj",
    },
    {
      userName: "Vince",
      userId: "vince1",
      message: "Hello there back",
      role: "self",
      messageId: "1l3kjfi",
    },
  ];


  const [messageList, setMessageList] = useState(convoData);
  const [userInput, setUserInput] = useState('');
  const socketRef = useRef<WebSocket | null>(null);

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
