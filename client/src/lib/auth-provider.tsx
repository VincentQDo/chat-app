"use client";

import { auth, validateToken } from "@/services/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  logOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const logOut = useCallback(async () => {
    await signOut(auth);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
  }, []);

  useEffect(() => {
    const authStateObs = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // signed in
        console.log("Auth state changed, user info: ", user);
        const newToken = (await auth.currentUser?.getIdToken(true)) ?? "";
        console.log("Fetching another token: ", newToken);
        localStorage.setItem("authToken", newToken);
        const authRes = await validateToken(localStorage.getItem("authToken"));
        console.log("validate token result: ", authRes);
        if (authRes.error === null) {
          console.log("Token authenticated", authRes.user);
          setUser(authRes.user);
        } else {
          // Token expired or something went wrong while authenticating
          console.log("Something went wrong while validating token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("userName");
          setUser(null);
          toast.error("User failed validation, please contact admin.");
        }
      } else {
        // signed out
        console.log("signed out");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userName");
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => {
      console.log("after auth state change");
      authStateObs();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, logOut }}>
      {isLoading ? <p>Authenticating...</p> : children}
    </AuthContext.Provider>
  );
}
