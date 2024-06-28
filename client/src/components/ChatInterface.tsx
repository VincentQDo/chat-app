"use client";

import Message from "@/components/Message";
import { ChatMsg } from "@/models/ChatMsg";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Socket, io } from 'socket.io-client';

export default function ChatInterface({ initialData, chatId }: { initialData: ChatMsg[], chatId: string }) {

    const [messageList, setMessageList] = useState(initialData);
    const [userInput, setUserInput] = useState('');
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:8080');

        socketRef.current.on('connect', () => {
            console.log('Connected!!')
            socketRef.current!.on('message', (data) => {
                console.log(data);
                setMessageList((currentMsgList) => [...currentMsgList, data])
            })
        })

        return () => {
            // clean up socket code here
            // disconnect socket
            socketRef.current?.disconnect();
        }
    }, [chatId]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newChatMsg: ChatMsg = {
            message: userInput,
            userId: 'vince1',
            role: 'self',
            userName: 'Vince',
            messageId: 0
        };
        socketRef.current?.emit('message', newChatMsg);
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
