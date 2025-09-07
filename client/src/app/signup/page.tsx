"use client"

import { signUp } from "@/services/firebase"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { AuthError } from "firebase/auth"
import { useRouter } from "next/navigation"

export default function SignUp() {
    const router = useRouter();
    const [authError, setAuthError] = useState("");
    const submitHandler = async (formData: FormData) => {
        const [email, password, username] = [formData.get("email")?.toString(), formData.get("password")?.toString(), formData.get("username")?.toString()]
        if (email && password && username) {
            const res = await signUp(email, password, username)
            if (res.error) {
                setAuthError((res.error as AuthError).message.split("Firebase: ")[1]);
            } else {
                console.log(res.user)
                router.push("/signin")
            }
        }
    }

    return (
        <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Sign up</h1>
                        <p className="text-balance text-muted-foreground">
                            Enter your information to create an account
                        </p>
                    </div>
                    <form className="grid gap-4" action={submitHandler}>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                name="username"
                                type="text"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input name="password" type="password" required />
                            <span>{authError}</span>
                        </div>
                        <Button type="submit" className="w-full">
                            Create an account
                        </Button>
                        <Button variant="outline" className="w-full">
                            Signup with Google
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="../signin" className="underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
