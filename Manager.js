import fs from 'fs'
import createArticle from './Articles.js'

async function manageArticle() {
	let date = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }).split(' ')[0]

	const year = date.split('/')[2]
	const month = date.split('/')[1]
	const day = parseInt(date.split('/')[0])

	const fileName = year + '_' + month + '_' + day + '.json'

	let article
	try {
		article = JSON.parse(fs.readFileSync('./dailys/' + fileName, 'utf-8'))
	} catch (error) {
		new Promise(async () => {
			let dayOfWeek = new Date().getDay
			let nextArticle = await createArticle({
				difficulty: dayOfWeek == 0 || dayOfWeek == 1 ? 'Easy' : dayOfWeek == 3 || dayOfWeek == 4 || dayOfWeek == 5 ? 'Medium' : 'Hard'
			})

			fs.writeFileSync('./dailys/' + fileName, JSON.stringify(nextArticle))
		})

		try {
			article = JSON.parse(fs.readFileSync('./dailys/' + year + '_' + month + '_' + (day - 1) + '.json', 'utf-8'))
		} catch (error) {
			article = 'Ops, desculpe-nos pelo transtorno, mas ainda estamos gerando o artigo de hoje. Tente recarregar a página e veja se ele já ficou pronto. =)'
		}
	}

	return article
}

export default manageArticle
