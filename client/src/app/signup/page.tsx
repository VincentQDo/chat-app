'use client';

import { signUp } from '@/services/firebase';
export default function SignUp() {
    const submitHandler = async (formData: FormData) => {
        const [email, password] = [formData.get('email')?.toString(), formData.get('password')?.toString()];
        if (email && password) {
            const user = await signUp(email, password);
            console.log(user);
        }
    }

    return (
        <form action={submitHandler}>
            <input className="bg-black" type="email" name="email" placeholder="Email" required />
            <input className='bg-black' type="password" name="password" placeholder="Password" required />
            <button type="submit">Create Account</button>
        </form>
    )
}