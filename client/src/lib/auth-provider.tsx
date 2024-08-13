'use client'

import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext<string | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    console.log(savedToken);
    if (savedToken) {
      setToken(savedToken);
    } else {
      router.push('/signin');
    }
  }, [router])
  return <AuthContext.Provider value={token}>
    {children}
  </AuthContext.Provider>
}
