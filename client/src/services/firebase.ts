// Import the functions you need from the SDKs you need
import { FirebaseError, initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export const authenticate = async (email: string, password: string) => {
    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return credential.user;
    } catch (error) {
        console.error(error);
        return undefined;   
    }
}
