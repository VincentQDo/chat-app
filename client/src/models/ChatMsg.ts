export interface ChatMsg {
  userName: string;
  userId: string;
  message: string;
  role: "other" | "self";
  messageId: number;
}
