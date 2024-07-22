'use client';
import { useAuth } from "@/hooks/useAuth";
import { ChatList } from "@/models/ChatList";
import fetchData from "@/services/fetchData";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Chats() {
    let [chatList, setChatList] = useState([] as ChatList[]);
    const userToken = useAuth();
    useEffect(() => {
        const initData = async () => {
            try {
                const fetchCall = fetchData(`/chatlist`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        'Content-Type': 'application/json',
                    }
                });
                const res = await fetchCall;
                const jsonRes = await res.json();
                console.log(jsonRes);
                if (Array.isArray(jsonRes)) {
                    setChatList(jsonRes);
                }
            } catch (error) {
                console.error(error);
            }
        }
        initData();
    }, []);

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
