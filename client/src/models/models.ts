export interface Message {
  messageId: string; // server assigned id
  userId: string;      // Identifier for the user who sent the message
  content: string;     // The content of the message
  contentType?: string;
  createdAt: number;   // timestamps are made on server (ms)
  editedAt?: number | null; // nullable
  isDeleted?: boolean;
  // Per-user statuses and convenience summary
  statuses?: Array<{ userId: string; status: "sent" | "delivered" | "read"; updatedAt: number }>;
  status?: "sent" | "delivered" | "read" | null; // sender's own status
  roomId?: string;
}

export interface User {
  id: string;
  userName: string;
}

export interface Relationship {
  userId1: string;
  userId2: string;
  status?: "pending" | "friend" | "blocked";
  createdAt?: number;
  updatedAt?: number;
}

export interface WebsocketServerResponse {
  error: string | null;
  message: Message | null;
}
