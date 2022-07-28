import fs from 'fs'
import createArticle from './Articles.js'

async function manageArticle() {
	let date = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }).split(',')[0]

	const year = date.split('/')[2]
	const month = date.split('/')[1]
	const day = date.split('/')[0]

	const fileName = year + '_' + month + '_' + day + '.json'

	let article
	try {
		article = JSON.parse(fs.readFileSync('./dailys/' + fileName, 'utf-8'))
	} catch (error) {
		article = await createArticle({
			difficulty: 'Easy'
		})

		fs.writeFileSync('./dailys/' + fileName, JSON.stringify(article))
	}
	console.log(fileName)

	return article
}

export default manageArticle
