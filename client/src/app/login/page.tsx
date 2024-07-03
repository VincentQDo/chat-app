'use client';

import { authenticate } from '@/services/firebase';
export default function Login() {
    const submitHandler = async (formData: FormData) => {
        const [email, password] = [formData.get('email')?.toString(), formData.get('password')?.toString()];
        if (email && password) {
            const user = await authenticate(email, password);
        }
    }

    return (
        <form action={submitHandler}>
            <input className="bg-black" type="email" name="email" placeholder="Email" required />
            <input className='bg-black' type="password" name="password" placeholder="Password" required />
            <button type="submit">Login</button>
        </form>
    )
}