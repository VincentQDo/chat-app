'use client';

import { Dashboard } from '@/components/Dashboard';
import { useRouter } from 'next/navigation';
import Link from "next/link"

import { authenticate } from '@/services/firebase';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react';

export default function Login() {
    const router = useRouter();
    const [authError, setAuthError] = useState('')

    const submitHandler = async (formData: FormData) => {
        const [email, password] = [formData.get('email')?.toString(), formData.get('password')?.toString()];
        if (email && password) {
            const res = await authenticate(email, password);
            if (res.user) {
                if (res.user.displayName) {
                    localStorage.setItem('authToken', await res.user.getIdToken());
                    localStorage.setItem('userName', res.user.displayName);
                    router.push('/');
                } else {
                    localStorage.removeItem('authToken')
                    localStorage.removeItem('userName')
                }
            } else if (res.error) {
                setAuthError(res.error.message.split('Firebase: ')[1]);
            }
        }
    }

    return (
        <div className="w-full lg:grid lg:min-h-[600px] xl:min-h-[800px]">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Login</h1>
                        <p className="text-balance text-muted-foreground">
                            Enter your email below to login to your account
                        </p>
                    </div>
                    <form className="grid gap-4" action={submitHandler}>
                        <p className="text-balance text-muted-foreground">
                            {authError}
                        </p>
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
                                <Link
                                    href="/forgot-password"
                                    className="ml-auto inline-block text-sm underline"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                            <Input name="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                        <Button variant="outline" className="w-full">
                            Login with Google
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="../signup" className="underline">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>)
}
