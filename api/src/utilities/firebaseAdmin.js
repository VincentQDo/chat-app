// firebaseAdmin.js
import admin from 'firebase-admin';

console.log('[INFO] service account env: ', process.env.FIREBASE_SERVICEACCOUNT)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICEACCOUNT)
console.log('[INFO] service account: ', serviceAccount)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export default admin;
