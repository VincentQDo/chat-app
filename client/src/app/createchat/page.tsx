'use client';

import fetchData from "@/services/fetchData"
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth-provider";

export interface User {
  id: string;
  name: string;
}

export default function CreateChat() {
  const token = useContext(AuthContext);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (token) {
      const data = async () => {
        const res = await fetchData(`/friend-list`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }

        });
        const jsonRes: User[] = await res.json();
        setUsers(jsonRes)
      }
      data();
    }
  }, [token]);

  const newChat = (user: User) => {
    console.log(user)
  }
  return (
    <ul>
      {users.map(user => {
        return <li>
          <a onClick={() => newChat(user)}>{user.name}</a>
        </li>;
      })}
    </ul>
  )
}
