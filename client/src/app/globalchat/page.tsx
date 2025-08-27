"use client";
import {
  Book,
  CornerDownLeft,
  LifeBuoy,
  LogOut,
  Settings2,
  SquareTerminal,
  SquareUser,
  Plus,
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
import { useEffect, useRef, useState, FormEvent } from 'react';
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
  const [rooms, setRooms] = useState([{ id: 'global', name: 'Global Chat', type: 'room' }]);
  const [selectedRoom, setSelectedRoom] = useState('global');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [modalMode, setModalMode] = useState<'room' | 'dm' | 'both'>('both');
  const [newRoomName, setNewRoomName] = useState('');
  const [newDmName, setNewDmName] = useState('');

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

  const handleSendMessage = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const messageObject: Message = {
      userId: userName,
      message: userInput,
      createdAt: Date.now(),
      roomId: (undefined as any)
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
      <div className="grid h-screen w-full pl-64">
        <aside className="fixed left-0 top-0 bottom-0 w-64 z-20 flex flex-col border-r bg-white/80 dark:bg-slate-900/80">
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <h2 className="text-lg tracking-tight">Chats</h2>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">Rooms</h3>
                <Button size="icon" variant="ghost" onClick={() => { setModalMode('room'); setShowRoomModal(true); }} aria-label="Add room">
                  <Plus className="size-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {rooms.filter(r => r.type === 'room').map(r => (
                  <Button key={r.id} variant={selectedRoom === r.id ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedRoom(r.id)}>{r.name}</Button>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">Direct Messages</h3>
                <Button size="icon" variant="ghost" onClick={() => { setModalMode('dm'); setShowRoomModal(true); }} aria-label="Add direct message">
                  <Plus className="size-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {rooms.filter(r => r.type === 'dm').map(r => (
                  <Button key={r.id} variant={selectedRoom === r.id ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedRoom(r.id)}>{r.name}</Button>
                ))}
              </div>
            </div>
          </div>
          <div className="px-4 py-3 border-t flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><SquareUser className="size-4" /> {numOfUsers} online</span>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => logout()} aria-label="Logout">
              <LogOut className="size-4" />
            </Button>
          </div>
        </aside>
        <div className="flex flex-col h-screen">
          <header className="sticky top-0 z-10 flex py-4 items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold">{rooms.find(r => r.id === selectedRoom)?.name ?? 'Global Chat'}</h1>
          </header>
          <main className="flex-1 overflow-hidden p-4">
            <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
              <div className="flex-1 overflow-auto flex flex-col-reverse" >
                {messages.filter(m => (m as any).roomId === selectedRoom || selectedRoom === 'global').map((data, index) =>
                  <p key={index} title={new Date((data as any).updatedAt || Date.now()).toLocaleString()}>
                    <span className="w-8 text-slate-400">{`${data.createdAt ? new Date(data.createdAt).toLocaleString() : ''}`}</span>{` ${data.userId}: ${data.message}`}
                  </p>
                )}
              </div>
              <form
                className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
                x-chunk="dashboard-03-chunk-1"
                ref={formRef}
                onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
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
      </div>
      {/* Add Room/DM Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{modalMode === 'dm' ? 'Start New DM' : 'Create Channel'}</h2>
            <div className="space-y-4">
              {modalMode === 'room' && (
                <div>
                  <Label htmlFor="roomName">Room Name</Label>
                  <input
                    id="roomName"
                    className="w-full mt-1 px-3 py-2 border rounded-lg bg-muted"
                    value={newRoomName}
                    onChange={e => setNewRoomName(e.target.value)}
                    placeholder="e.g. Project X"
                  />
                  <Button className="mt-2 w-full" onClick={() => {
                    if (newRoomName.trim()) {
                      const id = `room:${newRoomName.trim().toLowerCase().replace(/\s+/g, '-')}`;
                      setRooms(prev => [...prev, { id, name: newRoomName.trim(), type: 'room' }]);
                      setSelectedRoom(id);
                      setShowRoomModal(false);
                      setNewRoomName('');
                    }
                  }}>
                    Create Channel
                  </Button>
                </div>
              )}
              {modalMode === 'dm' && (
                <div>
                  <Label htmlFor="dmName">Username</Label>
                  <input
                    id="dmName"
                    className="w-full mt-1 px-3 py-2 border rounded-lg bg-muted"
                    value={newDmName}
                    onChange={e => setNewDmName(e.target.value)}
                    placeholder="e.g. alice"
                  />
                  <Button className="mt-2 w-full" onClick={() => {
                    if (newDmName.trim()) {
                      const id = `dm:${newDmName.trim().toLowerCase()}`;
                      setRooms(prev => [...prev, { id, name: newDmName.trim(), type: 'dm' }]);
                      setSelectedRoom(id);
                      setShowRoomModal(false);
                      setNewDmName('');
                    }
                  }}>
                    Start Chat
                  </Button>
                </div>
              )}
              {modalMode === 'both' && (
                <>
                  <div>
                    <Label htmlFor="roomName">Room Name</Label>
                    <input
                      id="roomName"
                      className="w-full mt-1 px-3 py-2 border rounded-lg bg-muted"
                      value={newRoomName}
                      onChange={e => setNewRoomName(e.target.value)}
                      placeholder="e.g. Project X"
                    />
                    <Button className="mt-2 w-full" onClick={() => {
                      if (newRoomName.trim()) {
                        const id = `room:${newRoomName.trim().toLowerCase().replace(/\s+/g, '-')}`;
                        setRooms(prev => [...prev, { id, name: newRoomName.trim(), type: 'room' }]);
                        setSelectedRoom(id);
                        setShowRoomModal(false);
                        setNewRoomName('');
                      }
                    }}>
                      Add Room
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    <Label htmlFor="dmName">1-on-1 Username</Label>
                    <input
                      id="dmName"
                      className="w-full mt-1 px-3 py-2 border rounded-lg bg-muted"
                      value={newDmName}
                      onChange={e => setNewDmName(e.target.value)}
                      placeholder="e.g. alice"
                    />
                    <Button className="mt-2 w-full" onClick={() => {
                      if (newDmName.trim()) {
                        const id = `dm:${newDmName.trim().toLowerCase()}`;
                        setRooms(prev => [...prev, { id, name: newDmName.trim(), type: 'dm' }]);
                        setSelectedRoom(id);
                        setShowRoomModal(false);
                        setNewDmName('');
                      }
                    }}>
                      Add 1-on-1
                    </Button>
                  </div>
                </>
              )}
              <Button variant="ghost" className="w-full mt-4" onClick={() => setShowRoomModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
