"use client";
import {
  Book,
  CornerDownLeft,
  LifeBuoy,
  LogOut,
  Settings2,
  SquareTerminal,
  SquareUser,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Message, WebsocketServerResponse } from '@/models/models';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchData, getBackendBaseUrl } from "@/services/backend-service";
import { logOut } from "@/lib/auth-provider";

export default function GlobalChat() {
  const apiUrl = getBackendBaseUrl();
  const [userInput, setUserInput] = useState('');
  const [userName, setUserName] = useState('');
  const [numOfUsers, setNumOfUsers] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [numOfUnreadMessages, setNumOfUnreadMessages] = useState(0);
  const isInputFocus = useRef(false);

  const socket = useRef<Socket | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);


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
        setMessages((prevMessages) => [{ ...data.message! }, ...prevMessages])
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
        messages.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
      }
      setMessages(messages)
    }

    data()

    return () => {
      socket.current?.disconnect()
    }
  }, [apiUrl])

  const handleSendMessage = (event: FormData) => {
    const messageObject: Message = {
      userId: userName,
      message: userInput,
      createdAt: Date.now()
    }
    setMessages([messageObject, ...messages])
    setUserInput('')
    socket.current?.emit('message', messageObject)
  }

  const isMobileDevice = () => {
    return /Android|webOS|Iphone|iPad|iPod/i.test(navigator.userAgent)
  }

  return (
    <>
      <div className="grid h-screen w-full pl-[56px]">
        <aside className="inset-y fixed  left-0 z-20 flex h-full flex-col border-r">
          <nav className="grid gap-1 p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg bg-muted"
                  aria-label="Playground"
                >
                  <SquareTerminal className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Playground
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Documentation"
                >
                  <Book className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Documentation
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Settings"
                >
                  <Settings2 className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Settings
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Users online"
                >
                  {numOfUsers}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Users Online
              </TooltipContent>
            </Tooltip>
          </nav>
          <nav className="mt-auto grid gap-1 p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-auto rounded-lg"
                  aria-label="Help"
                >
                  <LifeBuoy className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Help
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-auto rounded-lg"
                  aria-label="Account"
                >
                  <SquareUser className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Account
              </TooltipContent>
            </Tooltip>
          </nav>
        </aside>
        <div className="flex flex-col h-screen">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold">Global Chat</h1>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-1.5 text-sm"
              onClick={() => logout()}
            >
              <LogOut className="size-3.5" />
              Logout
            </Button>
          </header>
          <main className="flex-1 overflow-hidden p-4">
            <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
              <div className="flex-1 overflow-auto flex flex-col-reverse" >
                {messages.map((data, index) =>
                  <p key={index} title={new Date(data.updatedAt!).toLocaleString()}>
                    <span className="w-8 text-slate-400">{`${data.createdAt ? new Date(data.createdAt).toLocaleString() : ''}`}</span>{` ${data.userId}: ${data.message}`}
                  </p>
                )}
              </div>
              <form
                className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
                x-chunk="dashboard-03-chunk-1"
                ref={formRef}
                action={handleSendMessage}
              >
                <Label htmlFor="message" className="sr-only">
                  Message
                </Label>
                <Textarea
                  ref={textAreaRef}
                  id="message"
                  placeholder="Type your message here..."
                  className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0 text-base"
                  value={userInput}
                  onFocus={() => onInputFocus()}
                  onBlur={() => onInputBlur()}
                  onChange={(event) => setUserInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey && !isMobileDevice()) {
                      event.preventDefault()
                      formRef.current?.requestSubmit()
                    }
                  }}
                />
                <div className="flex items-center p-3 pt-0">
                  <Button type="submit" size="sm" className="ml-auto gap-1.5">
                    Send Message
                    <CornerDownLeft className="size-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div></>
  );
}
