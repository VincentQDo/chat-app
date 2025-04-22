import express from 'express'
import { getAllMessages } from '../db/database.js'

const router = express.Router()

router.get('/', async (req, res) => {
	console.log('[INFO] Getting messages with body', req.body)
	const data = await getAllMessages()
	res.json(data)
})

export default router
