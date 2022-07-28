import express from 'express'
import createArticle from './Articles.js'
import manageArticle from './Manager.js'
import cors from 'cors'

const server = express()

server.use(
	cors({
		origin: '*'
	})
)

server.get('/', cors(), async (request, response) => {
	try {
		response.send(await manageArticle())
	} catch (error) {
		console.error(error)
	}
})

server.listen(process.env.PORT || 3000, () => {
	console.log('Server Started')
})
