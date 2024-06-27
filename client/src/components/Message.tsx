import { ChatMsg } from "@/models/ChatMsg";

export default function Message({ message }: { message: ChatMsg }) {
    return (
        <div>
            <p>
                {message.userName}: {message.message}
            </p>
        </div>
    )
}