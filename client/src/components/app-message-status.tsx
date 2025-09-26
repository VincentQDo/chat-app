import { CheckCheck } from "lucide-react";

type MessageStatus = "sent" | "delivered" | "read";

interface AppMessageStatusProps {
  status: MessageStatus;
  isMine: boolean;
}

const STATUS_CONFIG = {
  sent: {
    text: "Sent",
    iconColor: "text-gray-400"
  },
  delivered: {
    text: "Delivered",
    iconColor: "text-gray-400"
  },
  read: {
    text: "Read",
    iconColor: "text-blue-500"
  }
} as const;

export default function AppMessageStatus({ status, isMine }: AppMessageStatusProps) {
  if (!isMine) return null;

  const config = STATUS_CONFIG[status];

  if (!config) return null;

  return (
    <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">
      <span>{config.text}</span>
      <CheckCheck className={`ml-1 inline-block h-3 w-3 align-text-bottom ${config.iconColor}`} />
    </span>
  );
}