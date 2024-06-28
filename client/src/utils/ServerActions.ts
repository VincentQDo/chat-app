'use server'

import { ChatMsg } from "@/models/ChatMsg";

export const fetchData = async (callbackFn: (messageList: ChatMsg[]) => void, chatId: string) => {
      try {
        const res = await fetch(`http://localhost:8080/messagelist?chatid=${chatId}`);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}: ${res.statusText}`)
        }
        const messageList = await res.json();
        console.log(messageList);
        callbackFn(messageList);
      } catch (error) {
        console.error('Error while getting messages', error);
      }
    }

