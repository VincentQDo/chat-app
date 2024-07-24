import { FirebaseAuthError } from "firebase-admin/lib/utils/error";

// Middleware to verify Firebase ID token
export async function verifyToken(req, res, next) {
    const unauthResponse = { code: '403', msg: 'Token not found' };
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token || token === 'null') {
        return res.status(403).send(unauthResponse);
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (err) {
        console.log('Authentication error', err, token);
        /** @type FirebaseAuthError */
        const firebaseAuthErr = err;
        unauthResponse.code = firebaseAuthErr.code;
        unauthResponse.msg = firebaseAuthErr.message;
        return res.status(403).send(unauthResponse);
    }
}

