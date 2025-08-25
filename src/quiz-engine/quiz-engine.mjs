// src/quiz-engine/quiz-engine.js

import { config as engineConfig } from './config.js';
import * as styles from './styles.js';
import { getLang, getTranslated, loadTranslations } from './i18n.js';

// --- Main Logic ---

export let quizInstanceCounter = 0;

/**
 * Resets the quiz instance counter. Primarily used for testing purposes
 * to ensure consistent quiz IDs across test runs.
 */
export function resetQuizInstanceCounter() {
    quizInstanceCounter = 0;
}

async function loadQuizModule(type) {
    try {
        return await import(`./quiz-types/${type}.js`);
    } catch (e) {
        console.error(`Failed to load module for quiz type: ${type}`, e);
        return null;
    }
}

async function buildQuiz(container, data, lang, ui, instanceId) {
    const quizConfig = data.config || {};
    container.innerHTML = ''; // Clear previous content

    // 1. Build Shell: Question
    const questionElement = document.createElement('h2');
    questionElement.textContent = getTranslated(data.question, lang);
    container.appendChild(questionElement);

    const form = document.createElement('form');
    form.addEventListener('submit', (e) => e.preventDefault());
    container.appendChild(form);

    // 2. Build Core: Load and build the specific quiz type UI
    const quizModule = await loadQuizModule(quizConfig.type);
    if (!quizModule) {
        container.innerHTML = `<p style="color: red;">${ui.errorUnknownType} "${quizConfig.type}".</p>`;
        return;
    }
    quizModule.buildUI(form, data, lang, ui, instanceId);

    // 3. Build Shell: Footer (Check Button and Messages)
    const messagesContainer = document.createElement('div');
    container.appendChild(messagesContainer);

    const checkButton = document.createElement('button');
    checkButton.textContent = ui.checkAnswer;
    checkButton.type = 'button';

    // Handle optional check button
    if (quizConfig.showCheckButton === false) {
        checkButton.style.display = 'none';
        // Logic for immediate check on select would go here if needed
    }
    container.appendChild(checkButton);

    checkButton.addEventListener('click', () => {
        const isCorrect = quizModule.checkAnswer(form, data, lang, instanceId);
        
        // Disable all inputs after checking
        form.querySelectorAll('input').forEach(input => input.disabled = true);
        checkButton.style.display = 'none';

        // Show result message
        const resultElement = document.createElement('p');
        resultElement.textContent = isCorrect ? ui.correct : ui.incorrect;
        styles.applyResultStyles(resultElement, isCorrect);
        
        messagesContainer.innerHTML = ''; // Clear previous messages
        messagesContainer.appendChild(resultElement);
        styles.applyMessageStyles(messagesContainer);

        // Show "Try Again" button if configured and answer is incorrect
        if (quizConfig.showTryAgainButton && !isCorrect) {
            const tryAgainButton = document.createElement('button');
            tryAgainButton.textContent = ui.tryAgain;
            tryAgainButton.type = 'button';
            styles.applyTryAgainButtonStyles(tryAgainButton);
            tryAgainButton.addEventListener('click', () => {
                buildQuiz(container, data, lang, ui, instanceId);
            });
            messagesContainer.appendChild(tryAgainButton);
        }
    });
}

export async function initializeQuizzes() {
    try {
        const lang = getLang();
        const ui = await loadTranslations(lang);

        const quizContainers = document.querySelectorAll(engineConfig.quizContainerSelector);
        for (const container of quizContainers) {
            const quizSrc = container.dataset.quizSrc;
            if (quizSrc) {
                quizInstanceCounter++;
                try {
                    const response = await fetch(quizSrc);
                    if (!response.ok) throw new Error(`Failed to load file: ${response.statusText}`);
                    const data = await response.json();
                    buildQuiz(container, data, lang, ui, quizInstanceCounter);
                } catch (error) {
                    console.error('Error loading or processing quiz data:', error);
                    container.innerHTML = `<p style="color: red;">${ui.errorLoading}</p>`;
                }
            } else {
                container.innerHTML = `<p style="color: red;">${ui.errorNoSrc}</p>`;
            }
        }
    } catch (error) {
        console.error("Failed to initialize quizzes:", error);
        document.querySelectorAll(engineConfig.quizContainerSelector).forEach(container => {
            container.innerHTML = `<p style="color: red;">Failed to load UI translations.</p>`;
        });
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', initializeQuizzes);