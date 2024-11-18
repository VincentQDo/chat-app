import { Socket } from 'socket.io';
import admin from './firebaseAdmin.js'

// Middleware to verify Firebase ID token
export async function verifyToken(req, res, next) {
    console.log('[INFO] Verifying token')
    const unauthResponse = { code: '403', msg: 'Token not found' }
    const token = req.headers.authorization?.split('Bearer ')[1]
    console.log('[INFO] Token: ', token)
    console.log('[INFO] Request Headers: ', req.headers)
    if (!token || token === 'null') {
        console.error('[ERROR] Invalid token.', token)
        return res.status(403).send(unauthResponse)
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token)
        req.user = decodedToken
        console.log('[INFO] Token valid', decodedToken)
        next()
    } catch (err) {
        console.log('Authentication error', err, token)
        const firebaseAuthErr = err
        unauthResponse.code = firebaseAuthErr.code
        unauthResponse.msg = firebaseAuthErr.message
        return res.status(403).send(unauthResponse)
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
        // Calculate when to check based on token exp
        const tokenExp = decodedToken.exp * 1000; // Convert to milliseconds
        const timeToExp = tokenExp - Date.now();
        const checkInterval = Math.min(timeToExp - 60000, 60 * 60 * 1000); // Check 1 min before exp or hourly

        socket.tokenCheckInterval = setInterval(async () => {
            try {
                await admin.auth().verifyIdToken(token);
            } catch (err) {
                clearInterval(socket.tokenCheckInterval);
                socket.emit('message', 'Token expired')
                socket.disconnect(true);
            }
        }, checkInterval);

        socket.on('disconnect', () => {
            if (socket.tokenCheckInterval) {
                clearInterval(socket.tokenCheckInterval);
            }
        });

        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
}
