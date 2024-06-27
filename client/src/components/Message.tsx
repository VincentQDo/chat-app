import { ChatMsg } from "@/models/ChatMsg";

export default function Message({ message }: { message: ChatMsg }) {
    return (
        <div key={message.messageId}>
            <p>
                {message.userName}: {message.message}
            </p>
        </div>
    )
}