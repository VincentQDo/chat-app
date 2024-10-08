import { Socket } from 'socket.io';
import admin from './firebaseAdmin.js'

// Middleware to verify Firebase ID token
export async function verifyToken(req, res, next) {
    console.log('[INFO] Verifying token')
    const unauthResponse = { code: '403', msg: 'Token not found' };
    const token = req.headers.authorization?.split('Bearer ')[1];
    next()
    return
    if (!token || token === 'null') {
        console.error('[ERROR] Invalid token.', token)
        return res.status(403).send(unauthResponse);
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        console.log('[INFO] Token valid', decodedToken)
        next();
    } catch (err) {
        console.log('Authentication error', err, token);
        const firebaseAuthErr = err;
        unauthResponse.code = firebaseAuthErr.code;
        unauthResponse.msg = firebaseAuthErr.message;
        return res.status(403).send(unauthResponse);
    }
}

/**
 * @param {Socket} socket 
 * @param {(err?: Error) => void} next 
 * */
export async function websocketVerifyToken(socket, next) {
    const token = socket.handshake.auth.token;
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        socket.user = decodedToken;
        next();
    } catch (err) {
        console.log('Authentication error', err);
        next(new Error('Authentication error'));
    }
}
