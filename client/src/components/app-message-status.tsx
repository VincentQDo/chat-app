import { MessageStatus } from "@/models/models";
import { CheckCheck } from "lucide-react";

interface AppMessageStatusProps {
  status: MessageStatus[];
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

  const statusPriority = { read: 3, delivered: 2, sent: 1 };

  const sortedStatuses = [...status].sort((a, b) => (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0));
  // Get the highest priority status
  const config = STATUS_CONFIG[sortedStatuses[0]?.status ?? "sent"];

  // If no valid status found, return null
  if (!config) return null;

  return (
    <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">
      <span>{config.text}</span>
      <CheckCheck className={`ml-1 inline-block h-3 w-3 align-text-bottom ${config.iconColor}`} />
    </span>
  );
}