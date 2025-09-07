// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { AuthError, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile, User } from "firebase/auth";
import { fetchData } from "./backend-service";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBcHs9F1cB1r1RrWNAP6q_XlQJ6NKiDciU",
    authDomain: "codephoenix-2b1a0.firebaseapp.com",
    projectId: "codephoenix-2b1a0",
    storageBucket: "codephoenix-2b1a0.appspot.com",
    messagingSenderId: "804928323675",
    appId: "1:804928323675:web:33fedb5169df900aad3f7e",
    measurementId: "G-7JSK298SJC"
};

export interface AuthResult {
    error: AuthError | string | null;
    user: User | null;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const authenticate = async (email: string, password: string): Promise<AuthResult> => {
    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return { error: null, user: credential.user };
    } catch (error: any) {
        console.error(error);
        return { error: error, user: null };
    }
}

export const signUp = async (email: string, password: string, username: string): Promise<AuthResult> => {
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: username });
        return { error: null, user: credential.user };
    } catch (error: any) {
        console.error(error);
        return { error: error, user: null };
    }
}

export async function validateToken(token: string | null): Promise<AuthResult> {
    if (token == null) return { error: "wtf where is the auth token?", user: null };
    try {
        const response = await fetchData("/authenticate");
        console.log("Authenticate res: ", response)
        if (response.status === 200) {
            return { error: null, user: auth.currentUser }
        } else {
            return { error: response.statusText, user: null }
        }
    } catch (error: any) {
        console.error("Soem kind of error during auth: ", error);
        return { error: error, user: null };
    }
}
