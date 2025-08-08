// src/quiz-engine/quiz-types/input-field.js

import { getTranslated } from '../i18n.js';
import { config as engineConfig } from '../config.js';

export function buildUI(form, data, lang, ui, instanceId) {
    const inputId = `quiz-${instanceId}-answer-input`;
    const input = document.createElement('input');
    input.type = 'text';
    input.id = inputId;
    input.name = 'answer';
    form.appendChild(input);
}

export function checkAnswer(form, data, lang, instanceId) {
    const config = data.config;
    const inputId = `quiz-${instanceId}-answer-input`;
    const userInput = form.querySelector(`#${inputId}`).value.trim();
    const correctAnswer = getTranslated(data.answer, lang);

    const isCorrect = config.caseSensitive 
        ? userInput === correctAnswer
        : userInput.toLowerCase() === correctAnswer.toLowerCase();

    if (!isCorrect && config.showExplanationOnError && data.explanation) {
        const explanationElement = document.createElement('p');
        explanationElement.textContent = getTranslated(data.explanation, lang);
        explanationElement.style.color = engineConfig.styles.correctColor;
        explanationElement.style.marginTop = engineConfig.styles.messageMarginTop;
        
        // Since this module doesn't have access to messagesContainer,
        // we can append it to the form. The main engine will handle the result message.
        form.appendChild(explanationElement);
    }

    return isCorrect;
}
