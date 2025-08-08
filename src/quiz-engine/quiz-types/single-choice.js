// src/quiz-engine/quiz-types/single-choice.js

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
        input.type = 'radio';
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
    const selectedInput = form.querySelector(`input[name="${name}"]:checked`);
    
    if (!selectedInput) {
        // Or handle this case more gracefully
        return false;
    }

    const selectedIndex = parseInt(selectedInput.value, 10);
    const isCorrect = data.answers[selectedIndex]?.correct === true;

    if (config.showExplanation === 'selected') {
        showDescription(selectedIndex, data, lang, instanceId);
    } else if (config.showExplanation === 'all') {
        data.answers.forEach((_, index) => showDescription(index, data, lang, instanceId));
    }
    
    return isCorrect;
}
