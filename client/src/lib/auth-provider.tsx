'use client'

import { auth, validateToken } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext<string | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // signed in
        const authRes = await validateToken(localStorage.getItem('authToken'))
        console.log(authRes)
        if (authRes.error === null) {
          console.log('Token authenticated')
        } else {
          // Token expired or something went wrong while authenticating
          console.log('Token expired')
          localStorage.removeItem('authToken')
          router.push('/signin')
        }
      } else {
        // signed out
        localStorage.removeItem('authToken')
        localStorage.removeItem('userName')
        router.push('/signin')
      }
    })

  }, [router, auth])
  return <AuthContext.Provider value={token}>
    {children}
  </AuthContext.Provider>
}
