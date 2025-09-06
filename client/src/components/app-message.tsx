import { useAuth } from "@/lib/auth-provider"

type AppMessageProps = {
  message: string
  date: string | Date
  isMine?: boolean
  senderName?: string // For non-mine messages
  senderId?: string   // For color generation
}

export default function AppMessage({
  message,
  date,
  isMine = false,
  senderName,
  senderId,
}: AppMessageProps) {
  const dateString = typeof date === "string" ? date : date.toLocaleString()
  const { user } = useAuth() // later for username and avatar

  // Generate consistent color based on userId/senderId
  const getUserColor = (id: string, isCurrentUser: boolean) => {
    if (isCurrentUser) return "text-blue-400"; // Your messages get a distinct blue

    // Color palette similar to Discord/Mattermost
    const colors = [
      "text-red-400", "text-orange-400", "text-amber-400", "text-yellow-400",
      "text-lime-400", "text-green-400", "text-emerald-400", "text-teal-400",
      "text-cyan-400", "text-sky-400", "text-indigo-400", "text-violet-400",
      "text-purple-400", "text-fuchsia-400", "text-pink-400", "text-rose-400"
    ];

    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getAvatarColor = (id: string, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-blue-500";

    const colors = [
      "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500",
      "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
      "bg-cyan-500", "bg-sky-500", "bg-indigo-500", "bg-violet-500",
      "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", "bg-rose-500"
    ];

    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Determine the user ID and display name for color generation
  const currentUserId = user?.uid || user?.email || "current-user";
  const messageUserId = isMine ? currentUserId : (senderId || senderName || "unknown");
  const displayName = isMine ? user?.displayName || "You" : (senderName || "Unknown User");

  const userColor = getUserColor(messageUserId, isMine);
  const avatarColor = getAvatarColor(messageUserId, isMine);

  // Get first letter for avatar
  const avatarLetter = displayName[0]?.toUpperCase() || "U";

  return (
    // Discord/Mattermost compact message style with color assignment
    <div className="flex items-start gap-3 px-4 hover:bg-muted/50 group">
      {/* Avatar with consistent color */}
      <div className={`h-8 w-8 rounded-full ${avatarColor} flex-shrink-0 mt-0.5 flex items-center justify-center text-white text-xs font-medium`}>
        {avatarLetter}
      </div>

      <div className="flex-1 min-w-0">
        {/* Username with consistent color and timestamp on same line */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`font-medium text-sm ${userColor}`}>
            {isMine ? `${displayName} (You)` : displayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {dateString}
          </span>
        </div>

        {/* Message content */}
        <div className="text-sm text-foreground break-words whitespace-pre-wrap leading-relaxed">
          {message}
        </div>
      </div>

      {/* Optional: Action buttons (visible on hover) */}
      {/* <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button className="h-6 w-6 rounded text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center">
          ⚙️
        </button>
      </div> */}
    </div>
  )
}