// firebaseAdmin.js
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICEACCOUNT)
console.log('service account: ', serviceAccount)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export default admin;
