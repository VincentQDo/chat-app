import { useAuth } from "@/lib/auth-provider"
import { Message } from "@/models/models"

// one day i will refactor this and the small message into one component with props but alas it's not today
export default function AppMessageLarge(params: { message: Message }) {
  const { content, createdAt, userId } = params.message;
  const dateString = createdAt ? new Date(createdAt).toLocaleString() : "";
  const { user } = useAuth() // later for username and avatar
  const isMine = userId === (user?.displayName || user?.email || "current-user"); // Using display name for now because the database is wack will fix later

  return (
    <div className={`flex items-start gap-2 ${isMine ? "justify-end" : ""}`}>
      {/* avatar (left for others) */}
      {!isMine && <div className="h-8 w-8 rounded-full bg-gray-300" />}

      <div
        className={`max-w-sm rounded-2xl px-3 py-2 cursor-default ${isMine
          ? "bg-primary text-primary-foreground"
          : "bg-muted"
          }`}
      >
        <p className="text break-words whitespace-pre-wrap">{content}</p>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {dateString}
        </span>
      </div>

      {/* avatar (right for your message) */}
      {isMine && <div className="h-8 w-8 rounded-full bg-gray-300" />}
    </div>
  )
}