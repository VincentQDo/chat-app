'use client';
import { ChatList } from "@/models/ChatList";
import fetchData from "@/services/fetchData";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Chats() {
    let [chatList, setChatList] = useState([] as ChatList[]);
    let [isUnauthorized, setIsUnauthorized] = useState(false);
    const router = useRouter();
    useEffect(() => {
        const initData = async () => {
            try {
                const userid = '01';
                const fetchCall = fetchData(`/chatlist?userid=${userid}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    }
                });
                const res = await fetchCall;
                const jsonRes = await res.json();
                console.log(jsonRes);
                if (Array.isArray(jsonRes)) {
                    setChatList(jsonRes);
                } else {
                    setIsUnauthorized(true);
                }
            } catch (error) {
                console.error(error);
                setIsUnauthorized(true);
            }
        }
        initData();
    }, []);

    useEffect(() => {
        if (isUnauthorized) {
            router.push('/login');
        }
    }, [isUnauthorized, router]);

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
