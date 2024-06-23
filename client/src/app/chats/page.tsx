import { ChatList } from "@/models/ChatList";
import Link from "next/link";

export default function Chats() {
    const chatList: ChatList[] = [
        {
            sessionId: "1023lksjdflkj",
            sessionName: "Chat wiht Bob",
            personId: "bob1",
            personName: "Bob",
        },
        {
            sessionId: "alksjlkdjrlkj",
            sessionName: "Chat wiht Alice",
            personId: "Alice1",
            personName: "Alice",
        },
    ];
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
