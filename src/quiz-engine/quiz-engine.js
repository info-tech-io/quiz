// quiz-engine.js

// --- I18n & Language Detection ---

function getLang() {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    if (['en', 'ru'].includes(lang)) {
        return lang;
    }
    // Fallback to browser language
    const browserLang = navigator.language.split('-')[0];
    if (['en', 'ru'].includes(browserLang)) {
        return browserLang;
    }
    // Default language
    return 'en';
}

async function loadTranslations(lang) {
    const response = await fetch(`/src/quiz-engine/locales/${lang}.json`);
    if (!response.ok) {
        throw new Error(`Could not load translation file for ${lang}`);
    }
    return response.json();
}

// Helper to get a translated string from a content object
function getTranslated(content, lang) {
    if (typeof content === 'string') {
        return content;
    }
    if (content && typeof content === 'object') {
        return content[lang] || content['en'] || content['ru'] || '';
    }
    return '';
}


// --- Main Logic ---

let quizInstanceCounter = 0; // Global counter for quiz instances

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const lang = getLang();
        const ui = await loadTranslations(lang);

        const quizContainers = document.querySelectorAll('.quiz-container');
        quizContainers.forEach(container => {
            const quizSrc = container.dataset.quizSrc;
            if (quizSrc) {
                quizInstanceCounter++;
                loadQuiz(container, quizSrc, lang, ui, quizInstanceCounter);
            } else {
                container.innerHTML = `<p style="color: red;">${ui.errorNoSrc}</p>`;
            }
        });
    } catch (error) {
        console.error("Failed to initialize quizzes:", error);
        // Display error in all containers if translations fail to load
        document.querySelectorAll('.quiz-container').forEach(container => {
            container.innerHTML = `<p style="color: red;">Failed to load UI translations.</p>`;
        });
    }
});

async function loadQuiz(container, src, lang, ui, instanceId) {
    try {
        const response = await fetch(src);
        if (!response.ok) {
            throw new Error(`Failed to load file: ${response.statusText}`);
        }
        const data = await response.json();
        buildQuiz(container, data, lang, ui, instanceId);
    } catch (error) {
        console.error('Error loading or processing quiz data:', error);
        container.innerHTML = `<p style="color: red;">${ui.errorLoading}</p>`;
    }
}

function buildQuiz(container, data, lang, ui, instanceId) {
    const config = data.config || {};
    container.innerHTML = '';

    const questionElement = document.createElement('h2');
    questionElement.textContent = getTranslated(data.question, lang);
    container.appendChild(questionElement);

    const form = document.createElement('form');
    form.addEventListener('submit', (e) => e.preventDefault());
    container.appendChild(form);

    switch (config.type) {
        case 'single-choice':
        case 'multiple-choice':
            buildChoiceQuiz(form, data, lang, instanceId);
            break;
        case 'input-field':
            buildInputFieldQuiz(form, data, instanceId);
            break;
        default:
            container.innerHTML = `<p style="color: red;">${ui.errorUnknownType} "${config.type}".</p>`;
            return;
    }

    const checkButton = document.createElement('button');
    checkButton.textContent = ui.checkAnswer;
    checkButton.type = 'button';
    container.appendChild(checkButton);

    const messagesContainer = document.createElement('div');
    container.appendChild(messagesContainer);

    checkButton.addEventListener('click', () => {
        checkAnswer(container, form, messagesContainer, data, lang, ui, instanceId);
        checkButton.style.display = 'none';
        form.querySelectorAll('input').forEach(input => input.disabled = true);
    });
}

// --- Builders ---

function buildChoiceQuiz(form, data, lang, instanceId) {
    const inputType = data.config.type === 'single-choice' ? 'radio' : 'checkbox';
    const name = `answer-group-${instanceId}`; // Unique name for radio button group
    data.answers.forEach((answer, index) => {
        const answerContainerId = `quiz-${instanceId}-answer-container-${index}`;
        const inputId = `quiz-${instanceId}-answer-${index}`;

        const answerContainer = document.createElement('div');
        answerContainer.id = answerContainerId;
        answerContainer.style.marginBottom = '10px';

        const input = document.createElement('input');
        input.type = inputType;
        input.id = inputId;
        input.name = name; // Use unique name
        input.value = index;

        const label = document.createElement('label');
        label.htmlFor = inputId;
        label.textContent = ` ${getTranslated(answer.text, lang)}`;

        answerContainer.appendChild(input);
        answerContainer.appendChild(label);
        form.appendChild(answerContainer);
    });
}

function buildInputFieldQuiz(form, data, instanceId) {
    const inputId = `quiz-${instanceId}-answer-input`;
    const input = document.createElement('input');
    input.type = 'text';
    input.id = inputId;
    input.name = 'answer';
    form.appendChild(input);
}

// --- Checkers ---

function checkAnswer(container, form, messagesContainer, data, lang, ui, instanceId) {
    const config = data.config;
    let isCorrect = false;

    switch (config.type) {
        case 'single-choice':
        case 'multiple-choice':
            isCorrect = checkChoiceAnswer(form, data, lang, instanceId);
            break;
        case 'input-field':
            isCorrect = checkInputFieldAnswer(form, messagesContainer, data, lang, instanceId);
            break;
    }

    // Style the container for inline layout
    messagesContainer.style.display = 'flex';
    messagesContainer.style.alignItems = 'center';
    messagesContainer.style.marginTop = '10px';

    const resultElement = document.createElement('p');
    resultElement.textContent = isCorrect ? ui.correct : ui.incorrect;
    resultElement.style.color = isCorrect ? 'green' : 'red';
    resultElement.style.margin = '0'; // Reset default margin for p
    messagesContainer.appendChild(resultElement);

    // Add a "Try Again" button only if the answer is incorrect
    if (!isCorrect) {
        const tryAgainButton = document.createElement('button');
        tryAgainButton.textContent = ui.tryAgain;
        tryAgainButton.type = 'button';
        tryAgainButton.style.marginLeft = '10px';
        tryAgainButton.addEventListener('click', () => {
            buildQuiz(container, data, lang, ui, instanceId);
        });
        messagesContainer.appendChild(tryAgainButton);
    }
}

function checkChoiceAnswer(form, data, lang, instanceId) {
    const config = data.config;
    const name = `answer-group-${instanceId}`; // Use the unique name to select inputs
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

function checkInputFieldAnswer(form, messagesContainer, data, lang, instanceId) {
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
        explanationElement.style.color = 'green';
        explanationElement.style.marginTop = '10px';
        messagesContainer.appendChild(explanationElement);
    }

    return isCorrect;
}

// --- Helpers ---

function showDescription(index, data, lang, instanceId) {
    const answer = data.answers[index];
    const descriptionText = getTranslated(answer.description, lang);
    if (!descriptionText) return;

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = descriptionText;
    descriptionElement.style.marginTop = '5px';
    descriptionElement.style.fontStyle = 'italic';
    descriptionElement.style.color = answer.correct ? 'green' : 'red';

    const answerContainerId = `quiz-${instanceId}-answer-container-${index}`; // Construct unique ID
    const answerContainer = document.getElementById(answerContainerId); // Find unique element
    if (answerContainer) {
        answerContainer.appendChild(descriptionElement);
    }
}