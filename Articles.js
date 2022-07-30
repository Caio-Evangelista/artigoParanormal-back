import stemming from './RSLP.js'
import Articles from './resource/Articles.json' assert { type: 'json' }
import StopWords from './resource/StopWords.json' assert { type: 'json' }

import Names from './resource/Names.json' assert { type: 'json' }
import Surnames from './resource/Surnames.json' assert { type: 'json' }

import puppeteer from 'puppeteer'

async function createArticle(configs) {
	const article = await getArticle(configs)
	article.originalText = await getArticleText(article.link)

	article.links = getArticleLinks(article.originalText)

	article.originalText = organizeText(article.originalText)
	article.words = getWordsList(article.originalText)

	article.options = getOptionList()

	async function getArticle(configs) {
		let possibleArticles = Articles.filter((article) => {
			for (let config of Object.keys(configs)) if (article[config] != configs[config]) return false
			return true
		})
		return possibleArticles[Math.floor(Math.random() * possibleArticles.length)]
	}

	async function getArticleText(link) {
		const browser = await puppeteer.launch()
		const page = await browser.newPage()
		await page.goto(`https://ordemparanormal.fandom.com/api.php?action=visualeditor&format=json&paction=wikitext&page=${link}&uselang=pt-br&formatversion=2`)

		const text = await page.evaluate(() => {
			return JSON.parse(document.getElementsByTagName('pre')[0].innerHTML)
		})

		await browser.close()

		return text.visualeditor.content.replace(/&gt;/gi, '>').replace(/&lt;/gi, '<')
	}

	function getArticleLinks(text) {
		let newText = text
		const rules = [
			[/<ref\s*([^<]*)<\/ref>/gim, ''], //Remover Referências
			[/<ref\s*([^\/]*)\/>/gim, ''], //Remover Referências
			[/<gallery\s*([^<]*)<\/gallery>/gim, ''], //Remover Galerias

			[/\[\[Categoria:\s?([^\]]*)\]\]/gim, ''], //Remover Categorias
			[/\[\[Arquivo:\s?([^|\]]*)\|?([^|\]]*)?\|?([^|\]]*)?\|?([^|\]]+)?\]\]/gim, ''] //Remover Arquivos
		]
		rules.forEach(([rule, template]) => {
			newText = newText.replace(rule, template)
		})

		const regexLinks = /\[\[\s?([^|\]]*)\|?([^\]]*)?\]\]/gim
		const links = []
		newText.replace(regexLinks, function (_, match) {
			const link = match.split(' ').join('_')
			if (links.indexOf(link) == -1) links.push(link)
		})

		return links
	}

	function organizeText(text) {
		const rules = [
			[/<ref\s*([^<]*)<\/ref>/gim, ''], //Remover Referências
			[/<gallery\s*([^<]*)<\/gallery>/gim, ''], //Remover Galerias

			[/\[\[Categoria:\s*([^\]]*)\]\]/gim, ''], //Remover Categorias
			[/\[\[Arquivo:\s*([^|\]]*)\|?([^|\]]*)?\|?([^|\]]*)?\|?([^|\]]+)?\]\]/gim, ''], //Remover Arquivos

			[/\[\[\s*([^|\]]*\|)?([^\]]*)\]\]/gim, '$2'], //Links Redirecionamento Interno
			[/\[[^\s\]]*\s?([^\]]*)\]/gim, '$1'], //Links Redirecionamento Externos

			[/{{EpLink\s*\|?([^|}]*)?\|?([^|}]*)?\|?([^}]*)?}}/gim, '$2º episódio de NomeTemporada$1'], //EpLink
			[/{{CampanhaLink\s*\|?([^}]*)?}}/gim, 'NomeTemporada$1'], //CampanhaLink
			[/{{Tooltip\s*\|?([^|}]*)?\|?([^}]*)?}}/gim, '$1'], //Tooltip
			[/{{f}}/gim, ''], //f
			[/{{Carece de fontes}}/gim, ''], //f
			[/{{nota\s*[^}]*}}/gim, ''], //nota
			[/{{slink\s*[^}]*}}/gim, ''], //slink
			[/{{citar\s*[^}]*}}/gim, ''], //citar
			[/{{Arsenal\s*[^}]*}}/gim, ''], //Arsenal
			[/{{Citação\s*\|?([^|}]*)?\|?([^}]*)?}}/gim, '<div class="row"> <div class="text-body2 text-italic q-my-lg q-ml-xl col-7 pull-quote">$1 <br /> <br /> - $2</div></div>'], //Citações
			[/{{Infobox\s*([^}]*)}}/gim, ''], //Infobox

			[/{{\s*([^}]*)}}/gim, ''], //Outros
			[/{\|\s*([^}]*)\|}/gim, ''], //Outros

			[/={6}\s*([^=]*)={6}/gim, '<div class="text-bold q-mt-md">$1</div>'], //Subtitulo4
			[/={5}\s*([^=]*)={5}/gim, '<div class="text-bold q-mt-md">$1</div>'], //Subtitulo3
			[/={4}\s*([^=]*)={4}/gim, '<div class="text-bold q-mt-md">$1</div>'], //Subtitulo2
			[/={3}\s*([^=]*)={3}/gim, '<div class="text-body1 text-bold q-mt-md">$1</div>'], //Subtitulo1
			[/={2}\s*([^=]*)={2}/gim, '<div class="text-h5 text-bold q-mt-lg">$1</div>'], //Cabeçalho

			[/'''([^']*)'''/gim, '<b>$1</b>'], //Negrito

			[/\*([^\n*]*)/gim, '<li>$1</li>'],
			[/\n+/gim, '<br /><br />'], //Outros
			[/<\/div><br \/><br \/>/gim, '</div>'], //Outros
			[/<\/li><br \/><br \/>/gim, '</li><br />'] //Outros
		]

		rules.forEach(([rule, template]) => {
			text = text.replace(rule, template)
		})

		let cont = 0
		let temporadaCorrigida = []
		for (let corrigirNomeTemporada of text.split('NomeTemporada')) {
			if (cont == 0) {
				temporadaCorrigida.push(corrigirNomeTemporada)
				cont++
				continue
			}

			temporadaCorrigida.push(['', 'A Ordem Paranormal', 'O Segredo na Floresta', 'Desconjuração', 'Calamidade', 'O Segredo na Ilha'][parseInt(corrigirNomeTemporada.slice(0, 1))] + corrigirNomeTemporada.slice(1))
		}
		text = temporadaCorrigida.join('')

		return '<div class="text-h4 text-bold q-mt-md">' + article.title + '</div>' + text
	}

	function getWordsList() {
		const wordList = {}

		const regexNoGetTagsHML = />([^<]*)</gim
		const regexGetWordsOnly = /([^\s0123456789,.\-+()'"“”!@#$%^&*\/\\|<>[\]{}ºª]*)/gim

		const phases = article.originalText.matchAll(regexNoGetTagsHML)

		for (const phase of phases) {
			const words = ('' + phase[1]).matchAll(regexGetWordsOnly)

			for (let word of words) {
				word = ('' + word[1]).trim().toLowerCase()
				if (!word) continue
				if (StopWords.indexOf(word) >= 0) continue

				const stemmingWord = stemming(word)
				if (wordList[stemmingWord]) wordList[stemmingWord]++
				else wordList[stemmingWord] = 1
			}
		}

		return wordList
	}

	function getOptionList() {
		let options = ['', '', '', '']

		let isName = true
		for (let name of article.title.split(' ')) {
			let colection
			if (isName) colection = Names
			else colection = Surnames

			let names = colection[article.type]
				.map((el) => {
					if (name == el)
						return {
							name: el,
							points: -1
						}

					let points = 0

					//Length proximity  (0 - 10)
					let lengthDistance = Math.abs(name.length - el.length)
					if (lengthDistance <= 4) points += (5 - lengthDistance) * 2

					//Word proximity (0 - 5)
					if (name[0] == el[0]) points += 2
					if (name[1] == el[1]) points += 1
					if (name[name.length - 2] == el[el.length - 2]) points += 1
					if (name[name.length - 1] == el[el.length - 1]) points += 1

					//Caos (0 - 1)
					points += [0, 1][Math.floor(Math.random() * 2)]

					return {
						name: el,
						points
					}
				})
				.sort((val1, val2) => (val1.points > val2.points ? -1 : 1))

			options[0] += names[0].name + ' '
			options[1] += names[1].name + ' '
			options[2] += names[2].name + ' '
			options[3] += names[3].name + ' '
			isName = false
		}

		options.push(article.title)

		return shuffle(options)
	}

	function shuffle(array) {
		let currentIndex = array.length,
			randomIndex

		while (currentIndex != 0) {
			randomIndex = Math.floor(Math.random() * currentIndex)
			currentIndex--
			;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
		}

		return array
	}

	return article
}

export default createArticle
