import express from 'express'
import { addMessage, deleteMessage, getAllMessages } from '../db/database.js'

const router = express.Router()

router.get('/', async (req, res) => {
	console.log('[INFO] Getting all messages')
	const data = await getAllMessages()
	res.json(data)
})

router.post('/', async (req, res) => {
	console.log('[INFO] Adding messaage from body', req.body)
	const data = await addMessage(req.body)
	res.json(data)
})

router.delete('/', async (req, res) => {
	console.log('[INFO] Deleting message from body', req.body)
	const data = await deleteMessage(req.body.messageId)
	res.json(data)
})

export default router
