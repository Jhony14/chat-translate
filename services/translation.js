const axios = require('axios');
const qs = require('qs');

async function detectLanguage(text) {
	let response = await axios.post('https://api-free.deepl.com/v2/translate', qs.stringify({
		auth_key: process.env.API_TRANSLATE,
		text: text,
		target_lang: 'EN'
	}));
	return response.data.translations[0].detected_source_language;
}

async function translateText(text, originalLang, targetLang) {
	let response = await axios.post('https://api-free.deepl.com/v2/translate', qs.stringify({
		auth_key: process.env.API_TRANSLATE,
		text: text,
		source_lang: originalLang,
		target_lang: targetLang
	}));
	return response.data.translations[0].text;
}

module.exports = { detectLanguage, translateText };
