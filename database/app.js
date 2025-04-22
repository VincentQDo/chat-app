import express from 'express'
import messageRouter from './routes/messages.js'

const app = express()
const PORT = process.env.PORT || 80

app.use(express.json())

app.use('/messages', messageRouter)

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`)
})
