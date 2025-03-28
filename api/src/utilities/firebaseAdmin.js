// firebaseAdmin.js
import admin from 'firebase-admin';

console.log('[DEBUG] Node environment ', process.env.NODE_ENV)
let serviceAccount
if (process.env.NODE_ENV === 'development') {
    serviceAccount = (await import('/workspace/service-account.json', { assert: { type: 'json' } })).default
    console.log('[INFO] service account file: ', serviceAccount)
} else {
    console.log('[INFO] service account env: ', process.env.FIREBASE_SERVICEACCOUNT)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICEACCOUNT)
    console.log('[INFO] service account: ', serviceAccount)
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export default admin;
