import { ChatMsg } from "@/models/ChatMsg";
import Link from "next/link";

export default async function Chat({ params }: { params: { chatId: string } }) {
  const data = params.chatId;
  console.log(data);
  // Get all data for this chat ID
  // const convoData = await fetch('getDataForId');
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

  const handleSubmit = (e: any) => {
    console.log(Object.fromEntries(new FormData(e.target).entries()));
  };
  return (
    <div>
      <Link href="/chats">Back to convo List</Link>
      {convoData.map((e) => (
        <div key={e.messageId}>
          <p>
            {e.userName}: {e.message}
          </p>
        </div>
      ))}

      <form method="post" onSubmit={handleSubmit}>
        <label>
          Chat Message:
          <input name="chatMsg"></input>
        </label>
        <button role="submit">Submit</button>
      </form>
    </div>
  );
}
