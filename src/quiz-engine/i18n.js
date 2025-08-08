// src/quiz-engine/i18n.js

import { config as engineConfig } from './config.js';

export function getLang() {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    if (engineConfig.supportedLanguages.includes(lang)) {
        return lang;
    }
    // Fallback to browser language
    const browserLang = navigator.language.split('-')[0];
    if (engineConfig.supportedLanguages.includes(browserLang)) {
        return browserLang;
    }
    // Default language
    return engineConfig.defaultLanguage;
}

export async function loadTranslations(lang) {
    const response = await fetch(`${engineConfig.localesPath}${lang}.json`);
    if (!response.ok) {
        throw new Error(`Could not load translation file for ${lang}`);
    }
    return response.json();
}

export function getTranslated(content, lang) {
    if (typeof content === 'string') {
        return content;
    }
    if (content && typeof content === 'object') {
        return content[lang] || content[engineConfig.defaultLanguage] || '';
    }
    return '';
}
