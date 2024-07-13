'use client';
import { ChatList } from "@/models/ChatList";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Chats() {
    let chatList: ChatList[] = [];
    let isUnauthorized: boolean = false;
    try {
        const userid = '01';
        const res = await fetch(`http://localhost:8080/chatlist?userid=${userid}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            }
        });
        res.bodyUsed
        const jsonRes = await res.json();
        console.log(jsonRes);
        if (Array.isArray(jsonRes)) {
            chatList = jsonRes;
        } else {
            isUnauthorized = true;
        }
    } catch (error) {
        console.error(error);
        isUnauthorized = true;
    }
    if (isUnauthorized) {
        redirect('/login');
    }
    // TODO should get data from some api call
    return (
        <div>
            <ul>
                {chatList.map((e) => (
                    <li key={e.sessionId}>
                        <Link href={`/chats/${e.sessionId}`}>{e.sessionName}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
