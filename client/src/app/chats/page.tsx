import { ChatList } from "@/models/ChatList";
import Link from "next/link";

export default async function Chats() {
    let chatList: ChatList[] = [];
    try {
        const userid = '01';
        const res = await fetch(`http://localhost:8080/chatlist?userid=${userid}`);
        chatList = await res.json();
    } catch (error) {
        console.error(error)
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
