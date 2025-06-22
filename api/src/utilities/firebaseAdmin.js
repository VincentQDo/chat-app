// firebaseAdmin.js
import admin from 'firebase-admin';

console.log('[DEBUG] Node environment ', process.env.NODE_ENV)
let serviceAccount
if (process.env.NODE_ENV === 'development') {
	const fs = await import('fs/promises')
	const file = await fs.readFile(new URL('/workspace/service-account.json', import.meta.url), 'utf8')
	serviceAccount = JSON.parse(file)
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
