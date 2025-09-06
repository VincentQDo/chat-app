"use client";

import { Message, WebsocketServerResponse } from '@/models/models';
import { useEffect, useRef, useState, FormEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchData, getBackendBaseUrl } from "@/services/backend-service";
import { logOut } from "@/lib/auth-provider";
import AppSidebar from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import AppMessage from '@/components/app-message';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';


export default function GlobalChat() {
  const apiUrl = getBackendBaseUrl();
  const [userInput, setUserInput] = useState('');
  const [userName, setUserName] = useState('');
  const [numOfUsers, setNumOfUsers] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [numOfUnreadMessages, setNumOfUnreadMessages] = useState(0);
  const isInputFocus = useRef(false);
  const [rooms, setRooms] = useState([{ id: 'global', name: 'Global Chat', type: 'room' }]);
  const [selectedRoom, setSelectedRoom] = useState('global');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const socket = useRef<Socket | null>(null);

  const addRoom = (name: string) => {
    const id = `room:${name.trim().toLowerCase().replace(/\s+/g, '-')}`;
    if (rooms.find(r => r.id === id)) return false;
    setRooms(prev => [...prev, { id, name: name.trim(), type: 'room' }]);
    setSelectedRoom(id);
    return true;
  }

  const addDm = (username: string) => {
    const id = `dm:${username.trim().toLowerCase()}`;
    if (rooms.find(r => r.id === id)) return false;
    setRooms(prev => [...prev, { id, name: username.trim(), type: 'dm' }]);
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
        new Notification("New Message", { body: data.message?.message })
      })
    } else {
      new Notification("New Message", { body: data.message?.message })
    }
  }

  const logout = () => {
    console.log('logging out')
    logOut()
  }

  useEffect(() => {
    console.log('input focus is changeing ', isInputFocus)
  }, [isInputFocus])

  const onInputFocus = () => {
    document.title = 'Nothing New';
    isInputFocus.current = true
    console.log('input is focused')
    setNumOfUnreadMessages(0)
  }

  const onInputBlur = () => {
    isInputFocus.current = false
    console.log('input is not focused')
  }

  useEffect(() => {
    if (numOfUnreadMessages === 0) {
      document.title = `Nothing new`
    } else {
      document.title = `(${numOfUnreadMessages}) New!`
    }
  }, [numOfUnreadMessages])

  useEffect(() => {
    setUserName(localStorage.getItem('userName') ?? '')
    console.log('API URL: ', apiUrl)
    console.log('User platform: ', navigator.userAgent)
    if (!apiUrl) {
      return;
    }
    socket.current = io(apiUrl, { auth: { token: localStorage.getItem('authToken') } });
    socket.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
    })

    socket.current.on('message', (data: WebsocketServerResponse) => {
      if (data.message) {
        setMessages((prevMessages) => [...prevMessages, { ...data.message! }])
        sendNotification(data)
      }
    })

    socket.current.on('userConnected', (data: WebsocketServerResponse) => {
      if (data) {
        const anyType = data as any;
        setNumOfUsers(anyType.message.users)
        console.log('User Connected: ', anyType.message.users);
        setMessages((prevMessages) => [{ message: 'User connected', userId: 'System' }, ...prevMessages])
      }
    })

    socket.current.on('userDisconnected', (data: WebsocketServerResponse) => {
      if (data) {
        const anyType = data as any;
        setNumOfUsers(anyType.message.users)
        console.log('User disconnected: ', anyType.message.users);
        setMessages((prevMessages) => [{ message: 'User disconnected', userId: 'System' }, ...prevMessages])
      }
    })

    socket.current.on('error', (err: WebsocketServerResponse) => {
      console.error('Error from server: ', err)
    })

    socket.current.on('disconnect', (reason) => {
      console.error('Disconnected from server for the following reason: ', reason)
      setMessages((prevMessages) => [{ message: 'Disconnected for the following reason: ' + reason, userId: 'System' }, ...prevMessages])
    })

    // get messages
    const data = async () => {
      const headers = await fetchData('/globalmessages')
      let messages: Message[] = []
      if (headers.status === 200) {
        messages = await headers.json()
        messages.sort((a, b) => Number(a.createdAt) - Number(b.createdAt))
      }
      setMessages(messages)
    }
    data()
    return () => {
      socket.current?.disconnect()
    }
  }, [apiUrl])

  const handleSendMessage = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!userInput.trim()) return;
    const messageObject: Message = {
      userId: userName,
      message: userInput,
      createdAt: Date.now(),
      roomId: selectedRoom,
    } as Message & { roomId?: string };
    setMessages([...messages, messageObject]);
    setUserInput('');
    // optimistic emit; backend will be wired later
    socket.current?.emit('message', messageObject);
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value)

    // Auto-resize
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  const isMobileDevice = () => {
    return /Android|webOS|Iphone|iPad|iPod/i.test(navigator.userAgent)
  }

  function handleKeyDownEvent(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    // Mark that the input is focused (useful for notifications)
    onInputFocus();

    // Send message on Enter (without Shift) on desktop. Allow Shift+Enter to insert a newline on desktop.
    if (!isMobileDevice() && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
      return;
    }

    // Allow Escape to blur the textarea (exit input mode)
    if (event.key === 'Escape') {
      (event.target as HTMLTextAreaElement).blur();
      onInputBlur();
    }
  }
  return (
    <>
      <SidebarProvider>
        <AppSidebar userName={userName}></AppSidebar>
        <SidebarInset className="flex flex-col h-screen">
          <header className='p-2 flex flex-shrink-0'>
            <SidebarTrigger></SidebarTrigger>
            <h1 className='text-lg font-semibold'>Global Chat</h1>
          </header>
          <Separator className="flex-shrink-0" />

          {/* Messages container - this will be scrollable and take up remaining space */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((msg, index) => (
              <AppMessage
                key={index}
                message={msg.message}
                date={new Date(msg.createdAt ?? Date.now()).toLocaleString()}
                isMine={msg.userId === userName}
              />
            ))}
          </div>

          {/* Input footer - this will stick to the bottom */}
          <footer className='p-4 w-full flex-shrink-0 border-t bg-background'>
            <form onSubmit={handleSendMessage} className='flex gap-2'>
              <Textarea
                ref={textareaRef}
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDownEvent}
                placeholder="Type your message here..."
                className='w-full text-base resize-none rounded-md p-2 min-h-[2.5rem] max-h-32 overflow-y-auto'
                rows={isMobileDevice() ? 1 : 3}
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
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}