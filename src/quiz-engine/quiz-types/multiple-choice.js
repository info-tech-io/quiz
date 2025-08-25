// src/quiz-engine/quiz-types/multiple-choice.js

import { getTranslated } from '../i18n.js';
import { applyExplanationStyles } from '../styles.js';

function showDescription(index, data, lang, instanceId) {
    const answer = data.answers[index];
    const descriptionText = getTranslated(answer.description, lang);
    if (!descriptionText) return;

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = descriptionText;
    applyExplanationStyles(descriptionElement, answer.correct);

    const answerContainerId = `quiz-${instanceId}-answer-container-${index}`;
    const answerContainer = document.getElementById(answerContainerId);
    if (answerContainer) {
        answerContainer.appendChild(descriptionElement);
    }
}

export function buildUI(form, data, lang, ui, instanceId) {
    const name = `answer-group-${instanceId}`;
    data.answers.forEach((answer, index) => {
        const answerContainerId = `quiz-${instanceId}-answer-container-${index}`;
        const inputId = `quiz-${instanceId}-answer-${index}`;

        const answerContainer = document.createElement('div');
        answerContainer.id = answerContainerId;
        answerContainer.style.marginBottom = '10px';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = inputId;
        input.name = name;
        input.value = index;

        const label = document.createElement('label');
        label.htmlFor = inputId;
        label.textContent = ` ${getTranslated(answer.text, lang)}`;

        answerContainer.appendChild(input);
        answerContainer.appendChild(label);
        form.appendChild(answerContainer);
    });
}

export function checkAnswer(form, data, lang, instanceId) {
    const config = data.config;
    const name = `answer-group-${instanceId}`;
    const selectedInputs = Array.from(form.querySelectorAll(`input[name="${name}"]:checked`));
    const selectedIndices = selectedInputs.map(input => parseInt(input.value, 10));

    const correctIndices = data.answers
        .map((answer, index) => answer.correct ? index : -1)
        .filter(index => index !== -1);
    
    const isCorrect = selectedIndices.length === correctIndices.length &&
                      selectedIndices.every(index => correctIndices.includes(index));

    if (config.showExplanation === 'selected') {
        selectedIndices.forEach(index => showDescription(index, data, lang, instanceId));
    } else if (config.showExplanation === 'all') {
        data.answers.forEach((_, index) => showDescription(index, data, lang, instanceId));
    }
    
    return isCorrect;
}
