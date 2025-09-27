"use client";

import { Message, WebsocketServerResponse } from "@/models/models";
import { useEffect, useRef, useState, FormEvent, useLayoutEffect } from "react";
import { io, Socket } from "socket.io-client";
import { fetchData, getBackendBaseUrl } from "@/services/backend-service";
import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import AppMessage from "@/components/app-message";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import AppMessageLarge from "@/components/app-message-large";
import { cn } from "@/lib/utils";
import { useCompact } from "@/lib/compact-provider";

interface TypingUser {
  userId: string;
  roomId: string;
}

export default function GlobalChat() {
  const apiUrl = getBackendBaseUrl();
  const [userInput, setUserInput] = useState("");
  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [numOfUnreadMessages, setNumOfUnreadMessages] = useState(0);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const isInputFocus = useRef(false);
  const [rooms, setRooms] = useState([{ id: "global", name: "Global Chat", type: "room" }]);
  const [selectedRoom, setSelectedRoom] = useState("global");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const socket = useRef<Socket | null>(null);
  const isMobile = useIsMobile();
  const shouldScroll = useRef(true);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTyping = useRef(false);
  const { isCompact } = useCompact();

  const addRoom = (name: string) => {
    const id = `room:${name.trim().toLowerCase().replace(/\s+/g, "-")}`;
    if (rooms.find(r => r.id === id)) return false;
    setRooms(prev => [...prev, { id, name: name.trim(), type: "room" }]);
    setSelectedRoom(id);
    return true;
  }

  const addDm = (username: string) => {
    const id = `dm:${username.trim().toLowerCase()}`;
    if (rooms.find(r => r.id === id)) return false;
    setRooms(prev => [...prev, { id, name: username.trim(), type: "dm" }]);
    setSelectedRoom(id);
    return true;
  }

  const sendNotification = (data: WebsocketServerResponse) => {
    setNumOfUnreadMessages((prev) => prev + 1)
    console.log(isInputFocus.current)
    if (isInputFocus.current) return
    if (!("Notification" in window)) return
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((result) => {
        console.log(result)
        new Notification("New Message", { body: data.message?.content })
      })
    } else {
      new Notification("New Message", { body: data.message?.content })
    }
  }

  const startTyping = () => {
    if (!isTyping.current && socket.current) {
      isTyping.current = true;
      socket.current.emit("typing:start", { roomId: selectedRoom, userId: userName });
    }
  };

  const stopTyping = () => {
    if (isTyping.current && socket.current) {
      isTyping.current = false;
      socket.current.emit("typing:stop", { roomId: selectedRoom, userId: userName });
    }
  };

  const handleTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Using window.setTimeout to get a number type instead of NodeJS.Timeout
    // because we're in a dual environment (browser + Node)
    typingTimeoutRef.current = window.setTimeout(() => {
      stopTyping();
    }, 3000); // Stop typing indicator after 3 seconds of inactivity
  };

  const getCurrentRoomTypingUsers = () => {
    return typingUsers
      .filter(user => user.roomId === selectedRoom && user.userId !== userName)
      .map(user => user.userId);
  };

  const renderTypingIndicator = () => {
    const currentTypingUsers = getCurrentRoomTypingUsers();

    if (currentTypingUsers.length === 0) return null;

    let typingText = "";
    if (currentTypingUsers.length === 1) {
      typingText = `${currentTypingUsers[0]} is typing...`;
    } else if (currentTypingUsers.length === 2) {
      typingText = `${currentTypingUsers[0]} and ${currentTypingUsers[1]} are typing...`;
    } else {
      typingText = `${currentTypingUsers.length} people are typing...`;
    }

    return (
      <div className="px-4 py-2 text-sm text-muted-foreground italic">
        {typingText}
        <span className="inline-flex ml-1">
          <span className="animate-bounce">.</span>
          <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
        </span>
      </div>
    );
  };

  useLayoutEffect(() => {
    if (messagesContainerRef.current && shouldScroll.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, typingUsers]);

  const markUnreadAsRead = () => {
    const unreadMessages = messages.filter(msg => msg.userId !== userName && !msg.statuses?.some(status => status.userId === userName && status.status === "read"));
    const requestBody = unreadMessages.map(msg => {
      return { messageId: msg.messageId, userId: userName, status: "read" }
    });

    if (requestBody.length === 0) {
      return;
    }
    // After sending read receipt, wait for server to confirm and update statuses via "read" event
    // Server will broadcast the updated statuses to all clients in the room, including this one
    socket.current?.emit("read", { statuses: requestBody });
  }

  const onInputFocus = () => {
    document.title = "Nothing New";
    isInputFocus.current = true
    console.log("input is focused")
    setNumOfUnreadMessages(0)
    markUnreadAsRead();
  }

  const onInputBlur = () => {
    isInputFocus.current = false
    console.log("input is not focused")
    stopTyping(); // Stop typing when input loses focus
  }

  useEffect(() => {
    if (numOfUnreadMessages === 0) {
      document.title = `Nothing new`
    } else {
      document.title = `(${numOfUnreadMessages}) New!`
    }
  }, [numOfUnreadMessages])

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    setUserName(storedUserName ?? "")
    console.log("API URL: ", apiUrl)
    console.log("User platform: ", navigator.userAgent)
    if (!apiUrl) {
      return;
    }
    socket.current = io(apiUrl, { auth: { token: localStorage.getItem("authToken") } });
    socket.current.on("connect", () => {
      console.log("Connected to Socket.IO server");
      // TODO - handle reconnection attempts and failures
      // Need to join and leave room in a separate useEffect
      socket.current?.emit("join:room", { roomId: selectedRoom, userId: storedUserName });
    })

    socket.current.on("message", (data: WebsocketServerResponse) => {
      console.log("New message event received:", data);
      if (data.message) {
        setMessages((prevMessages) => [...prevMessages, { ...data.message! }])
        sendNotification(data)
      }
    })

    socket.current.on("delivered", (data: { success: { statuses: any[] } }) => {
      const updatedStatuses = data.success.statuses;
      console.log("Delivered message event received:", updatedStatuses);
      if (updatedStatuses.length === 0) return;
      setMessages((prevMessages) =>
        prevMessages.map(msg => {
          const updatedMessageStatuses = updatedStatuses.filter((status: any) => status.messageId === msg.messageId)
          if (updatedMessageStatuses.length === 0) return msg;
          msg.statuses = updatedMessageStatuses;
          return msg;
        })
      );
    });

    socket.current.on("read", (data: { success: { statuses: any[] } }) => {
      const updatedStatuses = data.success.statuses;
      console.log("Read message event received:", updatedStatuses);
      if (updatedStatuses.length === 0) return;
      setMessages((prevMessages) =>
        prevMessages.map(msg => {
          const updatedMessageStatuses = updatedStatuses.filter((status: any) => status.messageId === msg.messageId)
          if (updatedMessageStatuses.length === 0) return msg;
          msg.statuses = updatedMessageStatuses;
          return msg;
        })
      );
    })

    // Typing indicator event listeners
    socket.current.on("typing:start", (data: { userId: string; roomId: string }) => {
      setTypingUsers(prev => {
        const exists = prev.find(user => user.userId === data.userId && user.roomId === data.roomId);
        if (exists) return prev;
        return [...prev, data];
      });
    });

    socket.current.on("typing:stop", (data: { userId: string; roomId: string }) => {
      setTypingUsers(prev =>
        prev.filter(user => !(user.userId === data.userId && user.roomId === data.roomId))
      );
    });

    socket.current.on("error", (err: WebsocketServerResponse) => {
      console.error("Error from server: ", err)
    })

    socket.current.on("disconnect", (reason) => {
      console.error("Disconnected from server for the following reason: ", reason)
      setMessages((prevMessages) => [
        {
          messageId: `system-${Date.now()}`,
          userId: "System",
          content: "Disconnected for the following reason: " + reason,
          contentType: "text",
          createdAt: Date.now(),
          roomId: selectedRoom,
          status: "sent",
        }, ...prevMessages
      ])
      // Clear typing indicators on disconnect
      setTypingUsers([]);
    })

    // get messages
    const data = async () => {
      const headers = await fetchData("GET", "/globalmessages")
      let messages: Message[] = []
      if (headers.status === 200) {
        messages = await headers.json()
        messages.sort((a, b) => Number(a.createdAt) - Number(b.createdAt))
      }
      setMessages(messages)
    }
    data()

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.current?.disconnect()
    }
  }, [apiUrl])

  // Clean up typing indicators when switching rooms
  useEffect(() => {
    stopTyping();
  }, [selectedRoom]);

  const handleSendMessage = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!userInput.trim()) return;

    // Stop typing indicator when sending message
    stopTyping();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const messageObject: Message = {
      messageId: tempId,
      userId: userName,
      content: userInput,
      contentType: "text",
      createdAt: Date.now(),
      roomId: selectedRoom,
      status: "sent",
    } as any;
    setMessages((prev) => [...prev, messageObject]);
    setUserInput("");
    shouldScroll.current = true;
    // optimistic emit; backend will be wired later
    setTimeout(() => {
      socket.current?.emit("message", messageObject);
    }, 5000);
  }

  const handleMessageScrolling = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // If the user is within 100px of the bottom, consider it "at the bottom"
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    shouldScroll.current = isAtBottom;
    console.log("User is at bottom:", isAtBottom);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUserInput(value);

    // Handle typing indicator
    if (value.trim() && !isTyping.current) {
      startTyping();
    } else if (!value.trim() && isTyping.current) {
      stopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      return;
    }

    // Reset typing timeout
    if (value.trim()) {
      handleTypingTimeout();
    }

    // Auto-resize
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = textarea.scrollHeight + "px"
  }

  function handleKeyDownEvent(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    // Send message on Enter (without Shift) on desktop. Allow Shift+Enter to insert a newline on desktop.
    if (!isMobile && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
      return;
    }

    // Allow Escape to blur the textarea (exit input mode)
    if (event.key === "Escape") {
      (event.target as HTMLTextAreaElement).blur();
      onInputBlur();
    }
  }

  return (
    <>
      <header className='p-2 flex flex-shrink-0 justify-between'>
        <div className='flex items-center'>
          <SidebarTrigger></SidebarTrigger>
          <h1 className='text-lg font-semibold'>Global Chat</h1>
        </div>
      </header>
      <Separator className="flex-shrink-0" />

        {/* Messages container - this will be scrollable and take up remaining space */}
        <div className={cn("flex-1 overflow-y-auto p-4 min-h-0", { "space-y-4": !isCompact })} ref={messagesContainerRef} onScroll={handleMessageScrolling}>
          {isCompact ?
            messages.map((msg, index) => (
              <AppMessage
                key={index}
                message={msg}
              />
            )) :
            messages.map((msg, index) => (
              <AppMessageLarge
                key={index}
                message={msg}
              />
            ))}

        {/* Typing indicator */}
        {renderTypingIndicator()}
      </div>

      {/* Input footer - this will stick to the bottom */}
      <footer className='p-4 w-full flex-shrink-0 bg-background'>
        <form onSubmit={handleSendMessage} className='flex gap-2'>
          <Textarea
            ref={textareaRef}
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDownEvent}
            onBlur={onInputBlur}
            onFocus={onInputFocus}
            placeholder="Type your message here..."
            className='w-full text-base resize-none rounded-md p-2 min-h-[2.5rem] max-h-32 overflow-y-auto'
            rows={isMobile ? 1 : 3}
            name='message'
          />
          <Button
            type="submit"
            size="icon"
            className="self-end flex-shrink-0 h-8 w-8 rounded-full p-0"
            disabled={!userInput.trim()}
            aria-label="Send message"
          >
            <SendHorizontal />
          </Button>
        </form>
      </footer>
    </>
  );
}