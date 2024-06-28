import ChatInterface from "@/components/ChatInterface";
import { ChatMsg } from "@/models/ChatMsg";

export default async function Chat({ params }: { params: { chatId: string } }) {
  try {
    const res = await fetch(`http://localhost:8080/messagelist?chatid=${params.chatId}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`)
    }
    const messageList: ChatMsg[] = await res.json();
    return (
      <ChatInterface initialData={messageList} chatId={params.chatId}></ChatInterface>
    )
  } catch (error) {
    console.error('Error while getting messages', error);
    return (
      <ChatInterface initialData={[]} chatId={params.chatId}></ChatInterface>
    )
  }
}