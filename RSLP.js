import RulesRSLP from './resource/RulesRSLP.json' assert { type: 'json' }

function stemming(word) {
	let wordReduced = word

	if (wordReduced.endsWith('s')) wordReduced = aplyRules(wordReduced, RulesRSLP.pluralReduction)

	if (wordReduced.endsWith('a')) wordReduced = aplyRules(wordReduced, RulesRSLP.feminineReduction)

	wordReduced = aplyRules(wordReduced, RulesRSLP.augmentativeDiminutiveReduction)
	wordReduced = aplyRules(wordReduced, RulesRSLP.adverbReduction)

	word = wordReduced
	wordReduced = aplyRules(wordReduced, RulesRSLP.nounSuffixReduction)

	if (wordReduced == word) wordReduced = aplyRules(wordReduced, RulesRSLP.verbSuffixReduction)
	if (wordReduced == word) wordReduced = aplyRules(wordReduced, RulesRSLP.vowelRemoval)

	wordReduced = wordReduced.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

	function aplyRules(word, rules) {
		let wordReduced = word
		for (let rule of formatRules(rules)) {
			if (!word.endsWith(rule[0])) continue

			if (rule[3].includes(wordReduced)) continue

			let newWord = wordReduced.slice(0, rule[0].length * -1) + rule[2]

			if (newWord.length < rule[1]) continue

			wordReduced = newWord
		}

		function formatRules(rules) {
			return rules.map((rule) => [rule[0], parseInt(rule[1]), rule[2], rule[3] == '*' ? [] : rule[3].split(',')])
		}

		return wordReduced
	}

	return wordReduced
}

export default stemming
