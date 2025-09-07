type AppMessageProps = {
  message: string
  date: string | Date
  isMine?: boolean
}

export default function AppMessageLarge({
  message,
  date,
  isMine = false,
}: AppMessageProps) {
  const dateString = typeof date === "string" ? date : date.toLocaleString()

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
        <p className="text break-words whitespace-pre-wrap">{message}</p>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {dateString}
        </span>
      </div>

      {/* avatar (right for your message) */}
      {isMine && <div className="h-8 w-8 rounded-full bg-gray-300" />}
    </div>
  )
}