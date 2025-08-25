import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initializeQuizzes, resetQuizInstanceCounter } from '../quiz-engine/quiz-engine.mjs';
import * as i18n from '../quiz-engine/i18n.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock dynamic imports for quiz types
vi.mock('../quiz-engine/quiz-types/single-choice.js', () => ({
  buildUI: vi.fn((form, data, lang, ui, instanceId) => {
    data.answers.forEach((answer, index) => {
      const answerOptionDiv = document.createElement('div');
      answerOptionDiv.className = 'answer-option';
      answerOptionDiv.id = `quiz-${instanceId}-answer-container-${index}`;

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `quiz-${instanceId}-answer`;
      input.id = `quiz-${instanceId}-answer-${index}`;
      input.value = index.toString(); // Store index as value
      answerOptionDiv.appendChild(input);

      const label = document.createElement('label');
      label.setAttribute('for', input.id);
      label.textContent = data.answers[index].text[lang] || data.answers[index].text.en;
      answerOptionDiv.appendChild(label);

      form.appendChild(answerOptionDiv);
    });
  }),
  checkAnswer: vi.fn((form, data, lang, instanceId) => {
    const selectedInput = form.querySelector(`input[name="quiz-${instanceId}-answer"]:checked`);
    if (!selectedInput) return false; // No answer selected

    const selectedIndex = parseInt(selectedInput.value);
    const isCorrect = data.answers[selectedIndex].correct;

    const config = data.config || {};

    // Simulate showDescription logic from single-choice.js
    if (config.showExplanation === 'selected') {
        const explanationContainer = document.querySelector(`#quiz-${instanceId}-answer-container-${selectedIndex}`);
        if (explanationContainer && data.answers[selectedIndex].description) {
            const p = document.createElement('p');
            p.textContent = data.answers[selectedIndex].description[lang] || data.answers[selectedIndex].description.en;
            explanationContainer.appendChild(p);
        }
    } else if (config.showExplanation === 'all') {
        data.answers.forEach((answer, index) => {
            const explanationContainer = document.querySelector(`#quiz-${instanceId}-answer-container-${index}`);
            if (explanationContainer && answer.description) {
                const p = document.createElement('p');
                p.textContent = answer.description[lang] || answer.description.en;
                explanationContainer.appendChild(p);
            }
        });
    }

    return isCorrect;
  }),
}));

vi.mock('../quiz-engine/quiz-types/multiple-choice.js', () => ({
  buildUI: vi.fn((form, data, lang, ui, instanceId) => {
    // Simulate adding checkboxes for multiple-choice
    data.answers.forEach((answer, index) => {
      const answerOptionDiv = document.createElement('div');
      answerOptionDiv.className = 'answer-option';
      answerOptionDiv.id = `quiz-${instanceId}-answer-container-${index}`;

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = `quiz-${instanceId}-answer`;
      input.id = `quiz-${instanceId}-answer-${index}`;
      input.value = index.toString();
      answerOptionDiv.appendChild(input);

      const label = document.createElement('label');
      label.setAttribute('for', input.id);
      label.textContent = data.answers[index].text[lang] || data.answers[index].text.en;
      answerOptionDiv.appendChild(label);

      form.appendChild(answerOptionDiv);
    });
  }),
  checkAnswer: vi.fn((form, data, lang, instanceId) => {
    const selectedInputs = Array.from(form.querySelectorAll(`input[name="quiz-${instanceId}-answer"]:checked`));
    const selectedIndices = selectedInputs.map(input => parseInt(input.value)).sort((a, b) => a - b);
    const correctIndices = data.answers.map((answer, index) => answer.correct ? index : -1).filter(index => index !== -1).sort((a, b) => a - b);

    const isCorrect = JSON.stringify(selectedIndices) === JSON.stringify(correctIndices);

    // Simulate showing explanation if configured (Corrected mock)
    const config = data.config || {};
    if (config.showExplanation === 'selected') {
        selectedIndices.forEach(selectedIndex => {
            const explanationContainer = document.querySelector(`#quiz-${instanceId}-answer-container-${selectedIndex}`);
            if (explanationContainer && data.answers[selectedIndex].description) {
                const p = document.createElement('p');
                p.textContent = data.answers[selectedIndex].description[lang] || data.answers[selectedIndex].description.en;
                explanationContainer.appendChild(p);
            }
        });
    } else if (config.showExplanation === 'all') {
        data.answers.forEach((answer, index) => {
            const explanationContainer = document.querySelector(`#quiz-${instanceId}-answer-container-${index}`);
            if (explanationContainer && answer.description) {
                const p = document.createElement('p');
                p.textContent = answer.description[lang] || answer.description.en;
                explanationContainer.appendChild(p);
            }
        });
    }

    return isCorrect;
  }),
}));

vi.mock('../quiz-engine/quiz-types/input-field.js', () => ({
  buildUI: vi.fn((form, data, lang, ui, instanceId) => {
    // Simulate adding a text input field
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `quiz-${instanceId}-answer-input`;
    form.appendChild(input);
  }),
  checkAnswer: vi.fn((form, data, lang, instanceId) => {
    const inputField = form.querySelector(`#quiz-${instanceId}-answer-input`);
    const userAnswer = inputField.value.trim(); // Trim whitespace as per functional requirements
    const correctAnswer = data.answer[lang] || data.answer.en; // Use data.answer, not data.answers[0].text
    const config = data.config || {};
    const caseSensitive = config.caseSensitive !== false; // Default to true if not specified

    let isCorrect = false;
    if (caseSensitive) {
      isCorrect = userAnswer === correctAnswer;
    } else {
      isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    }

    // Simulate showing explanation on error from input-field.js
    if (!isCorrect && config.showExplanationOnError && data.explanation) {
        const explanationElement = document.createElement('p');
        explanationElement.textContent = data.explanation[lang] || data.explanation.en;
        form.appendChild(explanationElement);
    }

    // Simulate showing result message
    const messagesContainer = form.parentElement.querySelector('div');
    if (messagesContainer) {
        const resultElement = document.createElement('p');
        resultElement.textContent = isCorrect ? 'Correct!' : 'Incorrect.';
        messagesContainer.innerHTML = '';
        messagesContainer.appendChild(resultElement);
    }

    return isCorrect;
  }),
}));

// --- Mocks and Helpers ---

let urlGetSpy;

beforeEach(() => {
    // Spy on the 'get' method of URLSearchParams prototype
    urlGetSpy = vi.spyOn(URLSearchParams.prototype, 'get');
    
    // Reset the DOM
    document.body.innerHTML = '';
    resetQuizInstanceCounter();

    // Mock fetch to handle both quiz data and locale files
    global.fetch = vi.fn((url) => {
        let filePath;
        if (url.startsWith('/src/quiz-engine/locales/')) {
            filePath = path.resolve(__dirname, '../..', url.substring(1));
        } else if (url.includes('quiz-examples/')) {
            // Adjust path for quiz-examples, assuming it's relative to the project root
            filePath = path.resolve(__dirname, '../../quiz-examples', url.split('/').pop());
        } else {
            return Promise.reject(new Error(`Unknown fetch URL: ${url}`));
        }

        if (!fs.existsSync(filePath)) {
            return Promise.reject(new Error(`File not found: ${filePath}`));
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(JSON.parse(fileContent)),
        });
    });

    // Mock i18n functions to control language loading
    // We will not mock getLang here, allowing the actual implementation to be tested for default language.
    // Specific language tests will mock it via initQuiz.
    vi.spyOn(i18n, 'loadTranslations').mockImplementation(async (lang) => {
        const filePath = path.resolve(__dirname, '../../src/quiz-engine/locales', `${lang}.json`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContent);
    });
});

afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks();
});

// Helper to initialize a single quiz
const initQuiz = async (quizFileName, lang) => {
    // Only override getLang mock if a specific language is provided
    if (lang !== undefined) {
        vi.spyOn(i18n, 'getLang').mockReturnValue(lang);
    }

    // Set up DOM for a single quiz
    document.body.innerHTML = `<div class="quiz-container" data-quiz-src="/quiz-examples/${quizFileName}"></div>`;

    // Trigger the DOMContentLoaded event and wait for quizzes to initialize
    await initializeQuizzes();
    await new Promise(process.nextTick); // Allow promises to resolve
};


// --- Test Suites ---

describe('Quiz Engine - Internationalization (i18n)', () => {

    it('should display the default interface language based on config', async () => {
        // We don't pass a lang parameter to initQuiz, so it should use the default from config.js
        await initQuiz('sc-base.json'); 

        const checkButton = document.querySelector('button');
        // Expect the text to be in English, as 'en' is the defaultLanguage in config.js
        expect(checkButton.textContent).toBe('Check Answer');
    });

    it('should display English interface when lang=en', async () => {
        await initQuiz('sc-base.json', 'en');

        const checkButton = document.querySelector('button');
        expect(checkButton.textContent).toBe('Check Answer');
    });

    it('should display translated question content', async () => {
        await initQuiz('sc-extension-mod.json', 'en');

        const question = document.querySelector('h2');
        expect(question.textContent).toBe('Which tag is the most important?');
    });

    it('should display translated explanation', async () => {
        await initQuiz('sc-extension-mod.json', 'en');

        // Simulate user interaction to trigger explanation
        // Assuming the first answer is correct for this test case based on main branch test
        const firstAnswerInput = document.querySelector('#quiz-1-answer-0');
        if (firstAnswerInput) {
            firstAnswerInput.click();
        }
        const checkButton = document.querySelector('button');
        if (checkButton) {
            checkButton.click();
        }
        
        await new Promise(process.nextTick); // Allow promises to resolve and DOM updates

        const desc = document.querySelector('#quiz-1-answer-container-0 p');
        expect(desc).not.toBeNull();
        expect(desc.textContent).toBe('Correct, h1 is the most important.');
    });
});

describe('Quiz Engine - Core Logic', () => {

    // Test for single-choice correct answer
    it('should show "Correct!" for a correct single-choice answer', async () => {
        await initQuiz('sc-base.json', 'en');

        const quizContainer = document.querySelector('.quiz-container');
        const firstAnswerInput = quizContainer.querySelector('#quiz-1-answer-0'); // Correct answer
        const checkButton = quizContainer.querySelector('button');

        firstAnswerInput.click();
        checkButton.click();

        await new Promise(process.nextTick);

        const resultElement = quizContainer.querySelector('p');
        expect(resultElement.textContent).toBe('Correct!');
    });

    // Test for single-choice incorrect answer
    it('should show "Incorrect." for an incorrect single-choice answer', async () => {
        await initQuiz('sc-base.json', 'en');

        const quizContainer = document.querySelector('.quiz-container');
        const secondAnswerInput = quizContainer.querySelector('#quiz-1-answer-1'); // Incorrect answer
        const checkButton = quizContainer.querySelector('button');

        secondAnswerInput.click();
        checkButton.click();

        await new Promise(process.nextTick);

        const resultElement = quizContainer.querySelector('p');
        expect(resultElement.textContent).toBe('Incorrect.');
    });

    // Test for multiple-choice correct answer
    it('should show "Correct!" for a correct multiple-choice answer', async () => {
        await initQuiz('mc-base.json', 'en');

        const quizContainer = document.querySelector('.quiz-container');
        const firstAnswerInput = quizContainer.querySelector('#quiz-1-answer-0'); // Correct: <div>
        const thirdAnswerInput = quizContainer.querySelector('#quiz-1-answer-2');  // Correct: <p>
        const checkButton = quizContainer.querySelector('button');

        firstAnswerInput.click();
        thirdAnswerInput.click();
        checkButton.click();

        await new Promise(process.nextTick);

        const resultElement = quizContainer.querySelector('p');
        expect(resultElement.textContent).toBe('Correct!');
    });

    // Test for multiple-choice incorrect answer
    it('should show "Incorrect." for an incorrect multiple-choice answer', async () => {
        await initQuiz('mc-base.json', 'en');

        const quizContainer = document.querySelector('.quiz-container');
        const firstAnswerInput = quizContainer.querySelector('#quiz-1-answer-0'); // Correct: <div>
        const secondAnswerInput = quizContainer.querySelector('#quiz-1-answer-1'); // Incorrect: <span>
        const checkButton = quizContainer.querySelector('button');

        firstAnswerInput.click(); // Select a correct one
        secondAnswerInput.click(); // Select an incorrect one
        checkButton.click();

        await new Promise(process.nextTick);

        const resultElement = quizContainer.querySelector('p');
        expect(resultElement.textContent).toBe('Incorrect.');
    });

    // Test for input-field correct answer (case-insensitive)
    it('should show "Correct!" for a correct input-field answer (case-insensitive)', async () => {
        await initQuiz('if-mod.json', 'en');

        const quizContainer = document.querySelector('.quiz-container');
        const inputField = quizContainer.querySelector('#quiz-1-answer-input');
        const checkButton = quizContainer.querySelector('button');

        inputField.value = 'cSS'; // Case-insensitive correct answer
        checkButton.click();

        await new Promise(process.nextTick);

        const resultElement = quizContainer.querySelector('p');
        expect(resultElement.textContent).toBe('Correct!');
    });

    // Test for input-field incorrect answer
    it('should show "Incorrect." for an incorrect input-field answer', async () => {
        await initQuiz('if-mod.json', 'en');

        const quizContainer = document.querySelector('.quiz-container');
        const inputField = quizContainer.querySelector('#quiz-1-answer-input');
        const checkButton = quizContainer.querySelector('button');

        inputField.value = 'wrong'; // Incorrect answer
        checkButton.click();

        await new Promise(process.nextTick);

        const resultElement = quizContainer.querySelector('p');
        expect(resultElement.textContent).toBe('Incorrect.');
    });

    // Test for input-field correct answer (case-sensitive)
    it('should show "Correct!" for a correct input-field answer (case-sensitive)', async () => {
        await initQuiz('if-base.json', 'en');

        const quizContainer = document.querySelector('.quiz-container');
        const inputField = quizContainer.querySelector('#quiz-1-answer-input');
        const checkButton = quizContainer.querySelector('button');

        inputField.value = 'CSS'; // Case-sensitive correct answer
        checkButton.click();

        await new Promise(process.nextTick);

        const resultElement = quizContainer.querySelector('p');
        expect(resultElement.textContent).toBe('Correct!');
    });
});

describe('Quiz Engine - Explanation Logic', () => {
    it('should display explanation only for the selected answer when config is "selected"', async () => {
        await initQuiz('sc-extension.json', 'en'); // This quiz uses showExplanation: "selected"

        // Simulate user selecting the second (incorrect) answer
        const secondAnswerInput = document.querySelector('#quiz-1-answer-1');
        secondAnswerInput.click();
        
        const checkButton = document.querySelector('button');
        checkButton.click();
        
        await new Promise(process.nextTick); // Allow DOM updates

        const firstExplanation = document.querySelector('#quiz-1-answer-container-0 p');
        const secondExplanation = document.querySelector('#quiz-1-answer-container-1 p');

        // The explanation for the unselected answer should NOT be present
        expect(firstExplanation).toBeNull(); 
        
        // The explanation for the selected answer SHOULD be present
        expect(secondExplanation).not.toBeNull();
        expect(secondExplanation.textContent).toBe('Incorrect, h6 is the least important.');
    });

    it('should display explanations for all answers when config is "all"', async () => {
        await initQuiz('sc-extension-mod.json', 'en'); // This quiz uses showExplanation: "all"

        // Simulate user selecting the first answer
        const firstAnswerInput = document.querySelector('#quiz-1-answer-0');
        firstAnswerInput.click();
        
        const checkButton = document.querySelector('button');
        checkButton.click();
        
        await new Promise(process.nextTick); // Allow DOM updates

        const firstExplanation = document.querySelector('#quiz-1-answer-container-0 p');
        const secondExplanation = document.querySelector('#quiz-1-answer-container-1 p');

        // Explanations for ALL answers should be present
        expect(firstExplanation).not.toBeNull();
        expect(firstExplanation.textContent).toBe('Correct, h1 is the most important.');
        
        expect(secondExplanation).not.toBeNull();
        expect(secondExplanation.textContent).toBe('Incorrect, h6 is the least important.');
    });

    it('should display explanations only for selected answers in multiple-choice when config is "selected"', async () => {
        await initQuiz('mc-extension.json', 'en'); // Uses showExplanation: "selected"

        // Simulate user selecting one correct (index 0) and one incorrect (index 1) answer
        document.querySelector('#quiz-1-answer-0').click();
        document.querySelector('#quiz-1-answer-1').click();
        
        document.querySelector('button').click();
        await new Promise(process.nextTick);

        const explanation0 = document.querySelector('#quiz-1-answer-container-0 p');
        const explanation1 = document.querySelector('#quiz-1-answer-container-1 p');
        const explanation2 = document.querySelector('#quiz-1-answer-container-2 p');

        // Explanations should exist for selected answers
        expect(explanation0).not.toBeNull();
        expect(explanation0.textContent).toBe('Correct, div is a block tags.');
        expect(explanation1).not.toBeNull();
        expect(explanation1.textContent).toBe('Incorrect, span is a line tag.');

        // Explanation should NOT exist for the unselected answer
        expect(explanation2).toBeNull();
    });

    it('should display explanations for all answers in multiple-choice when config is "all"', async () => {
        await initQuiz('mc-extension-mod.json', 'en'); // Uses showExplanation: "all"

        // Simulate user selecting one answer
        document.querySelector('#quiz-1-answer-0').click();
        
        document.querySelector('button').click();
        await new Promise(process.nextTick);

        const explanation0 = document.querySelector('#quiz-1-answer-container-0 p');
        const explanation1 = document.querySelector('#quiz-1-answer-container-1 p');
        const explanation2 = document.querySelector('#quiz-1-answer-container-2 p');

        // Explanations should exist for ALL answers, regardless of selection
        expect(explanation0).not.toBeNull();
        expect(explanation0.textContent).toBe('Correct, div is a block tags.');
        expect(explanation1).not.toBeNull();
        expect(explanation1.textContent).toBe('Incorrect, span is a line tag.');
        expect(explanation2).not.toBeNull();
        expect(explanation2.textContent).toBe('Correct, p is a block tags.');
    });

    it('should display explanation for input-field on incorrect answer when configured', async () => {
        await initQuiz('if-extension.json', 'en'); // Uses showExplanationOnError: true

        const inputField = document.querySelector('#quiz-1-answer-input');
        inputField.value = 'wrong answer';
        
        document.querySelector('button').click();
        await new Promise(process.nextTick);

        const explanation = document.querySelector('form p');
        expect(explanation).not.toBeNull();
        expect(explanation.textContent).toBe('The correct answer is CSS.');
    });

    it('should NOT display explanation for input-field on correct answer', async () => {
        await initQuiz('if-extension.json', 'en'); // Uses showExplanationOnError: true

        const inputField = document.querySelector('#quiz-1-answer-input');
        inputField.value = 'CSS'; // Correct answer
        
        document.querySelector('button').click();
        await new Promise(process.nextTick);

        const explanation = document.querySelector('form p');
        expect(explanation).toBeNull();
    });

    it('should NOT display explanation for input-field if showExplanationOnError is false', async () => {
        await initQuiz('if-base.json', 'en'); // Uses showExplanationOnError: false

        const inputField = document.querySelector('#quiz-1-answer-input');
        inputField.value = 'wrong answer';
        
        document.querySelector('button').click();
        await new Promise(process.nextTick);

        const explanation = document.querySelector('form p');
        expect(explanation).toBeNull();
    });
});

describe('Quiz Engine - "Try Again" Button', () => {
    it('should display "Try Again" button on incorrect answer if configured', async () => {
        await initQuiz('sc-base.json', 'en'); // This quiz now has showTryAgainButton: true

        // Simulate incorrect answer
        document.querySelector('#quiz-1-answer-1').click();
        document.querySelector('button[type="button"]').click();
        await new Promise(process.nextTick);

        const tryAgainButton = document.querySelector('button[type="button"]');
        expect(tryAgainButton).not.toBeNull();
        expect(tryAgainButton.textContent).toBe('Try Again');
    });

    it('should NOT display "Try Again" button on correct answer', async () => {
        await initQuiz('sc-base.json', 'en');

        // Simulate correct answer
        document.querySelector('#quiz-1-answer-0').click();
        document.querySelector('button[type="button"]').click();
        await new Promise(process.nextTick);

        const resultMessage = document.querySelector('p');
        expect(resultMessage.textContent).toBe('Correct!');
        
        // The "Check Answer" button is hidden, not removed. We need to check
        // that no *visible* button has the "Try Again" text.
        const buttons = document.querySelectorAll('button[type="button"]');
        let tryAgainButtonVisible = false;
        buttons.forEach(button => {
            if (button.textContent === 'Try Again' && button.style.display !== 'none') {
                tryAgainButtonVisible = true;
            }
        });
        expect(tryAgainButtonVisible).toBe(false);
    });

    it('should NOT display "Try Again" button if not configured', async () => {
        // Let's use sc-no-try-again.json which has the flag set to false.
        await initQuiz('sc-no-try-again.json', 'en');

        // Simulate incorrect answer
        document.querySelector('#quiz-1-answer-1').click();
        document.querySelector('button[type="button"]').click();
        await new Promise(process.nextTick);

        // Check the main result message, ignoring any additional explanation text
        const resultMessage = document.querySelector('.quiz-container > div > p');
        expect(resultMessage.textContent).toBe('Incorrect.');

        const buttons = document.querySelectorAll('button[type="button"]');
        let tryAgainButtonVisible = false;
        buttons.forEach(button => {
            if (button.textContent === 'Try Again' && button.style.display !== 'none') {
                tryAgainButtonVisible = true;
            }
        });
        expect(tryAgainButtonVisible).toBe(false);
    });

    it('should reset the quiz when "Try Again" button is clicked', async () => {
        await initQuiz('sc-base.json', 'en');

        // 1. Give an incorrect answer
        const incorrectAnswerInput = document.querySelector('#quiz-1-answer-1');
        incorrectAnswerInput.click();
        document.querySelector('button[type="button"]').click();
        await new Promise(process.nextTick);

        // 2. Verify the "Try Again" button is there
        let tryAgainButton = document.querySelector('button[type="button"]');
        expect(tryAgainButton).not.toBeNull();
        expect(tryAgainButton.textContent).toBe('Try Again');
        
        // All inputs should be disabled
        document.querySelectorAll('input').forEach(input => {
            expect(input.disabled).toBe(true);
        });

        // 3. Click "Try Again"
        tryAgainButton.click();
        await new Promise(process.nextTick);

        // 4. Verify the quiz is reset
        // The "Check Answer" button should be back
        const checkButton = document.querySelector('button[type="button"]');
        expect(checkButton).not.toBeNull();
        expect(checkButton.textContent).toBe('Check Answer');

        // The result message and "Try Again" button should be gone
        const resultMessage = document.querySelector('p');
        expect(resultMessage).toBeNull();
        tryAgainButton = document.querySelector('button:last-child'); // Re-query
        expect(tryAgainButton.textContent).not.toBe('Try Again');


        // Inputs should be enabled again
        document.querySelectorAll('input').forEach(input => {
            expect(input.disabled).toBe(false);
        });

        // Inputs should be cleared (unchecked)
        const selectedInput = document.querySelector('input:checked');
        expect(selectedInput).toBeNull();
    });
});

// Helper to initialize multiple quizzes
const initMultipleQuizzes = async (quizFileNames, lang) => {
    if (lang !== undefined) {
        vi.spyOn(i18n, 'getLang').mockReturnValue(lang);
    }

    // Set up DOM for multiple quizzes
    document.body.innerHTML = quizFileNames
        .map(fileName => `<div class="quiz-container" data-quiz-src="/quiz-examples/${fileName}"></div>`)
        .join('<hr>');

    // Trigger the DOMContentLoaded event and wait for quizzes to initialize
    await initializeQuizzes();
    await new Promise(process.nextTick); // Allow promises to resolve
};

describe('Quiz Engine - Multi-Quiz Isolation', () => {
    it('should isolate explanation logic between multiple quizzes', async () => {
        // Using sc-base (no explanation) and sc-extension (has explanation)
        await initMultipleQuizzes(['sc-base.json', 'sc-extension.json'], 'en');

        const quizContainers = document.querySelectorAll('.quiz-container');
        const firstQuizContainer = quizContainers[0];
        const secondQuizContainer = quizContainers[1];

        // Action: Select an answer and check it in the *second* quiz (instance ID 2)
        const secondQuizRadioButton = secondQuizContainer.querySelector('#quiz-2-answer-0');
        const secondQuizCheckButton = secondQuizContainer.querySelector('button');

        secondQuizRadioButton.click();
        secondQuizCheckButton.click();
        await new Promise(process.nextTick);

        // Assertion 1: The first quiz should NOT have any explanation text.
        const firstQuizExplanation = firstQuizContainer.querySelector('[id^="quiz-1-answer-container-"] p');
        expect(firstQuizExplanation).toBeNull();

        // Assertion 2: The second quiz SHOULD have an explanation for the selected answer.
        const secondQuizExplanation = secondQuizContainer.querySelector('#quiz-2-answer-container-0 p');
        expect(secondQuizExplanation).not.toBeNull();
        expect(secondQuizExplanation.textContent).toContain('Correct, h1 is the most important.');
    });

    it('should not change the state of other quizzes when one is answered', async () => {
        await initMultipleQuizzes(['sc-extension.json', 'sc-base.json'], 'en');

        const [firstQuizContainer, secondQuizContainer] = document.querySelectorAll('.quiz-container');

        // Action: Answer the first quiz incorrectly to trigger maximum state change
        firstQuizContainer.querySelector('#quiz-1-answer-1').click(); // Incorrect answer
        firstQuizContainer.querySelector('button').click();
        await new Promise(process.nextTick);

        // Assertions: Check that the second quiz is completely unchanged
        const secondQuizCheckButton = secondQuizContainer.querySelector('button');
        expect(secondQuizCheckButton.textContent).toBe('Check Answer');
        expect(secondQuizCheckButton.style.display).not.toBe('none');

        const secondQuizInputs = secondQuizContainer.querySelectorAll('input');
        secondQuizInputs.forEach(input => {
            expect(input.disabled).toBe(false);
            expect(input.checked).toBe(false);
        });

        const secondQuizResultMessage = secondQuizContainer.querySelector('.quiz-container > div > p');
        expect(secondQuizResultMessage).toBeNull();
    });

    it('should maintain the state of a completed quiz after another quiz is answered', async () => {
        await initMultipleQuizzes(['sc-extension.json', 'if-mod.json'], 'en');
        const [firstQuizContainer, secondQuizContainer] = document.querySelectorAll('.quiz-container');

        // Action Part 1: Complete the first quiz (incorrectly)
        firstQuizContainer.querySelector('#quiz-1-answer-1').click();
        firstQuizContainer.querySelector('button').click();
        await new Promise(process.nextTick);

        // "Snapshot" the state of the first quiz
        const firstQuizResultElement = Array.from(firstQuizContainer.querySelectorAll('div > p')).find(p => p.textContent === 'Incorrect.');
        const firstQuizInputs = firstQuizContainer.querySelectorAll('input');
        const firstQuizTryAgainButton = Array.from(firstQuizContainer.querySelectorAll('button')).find(b => b.textContent === 'Try Again');

        expect(firstQuizResultElement).not.toBeUndefined(); // Check that the "Incorrect." message exists
        expect(firstQuizTryAgainButton).not.toBeUndefined();
        firstQuizInputs.forEach(input => expect(input.disabled).toBe(true));

        // Action Part 2: Complete the second quiz
        secondQuizContainer.querySelector('input[type="text"]').value = 'css';
        secondQuizContainer.querySelector('button').click();
        await new Promise(process.nextTick);

        // Assertions: Re-check the state of the first quiz to ensure it hasn't changed
        const firstQuizResultElementAfter = Array.from(firstQuizContainer.querySelectorAll('div > p')).find(p => p.textContent === 'Incorrect.');
        const firstQuizInputsAfter = firstQuizContainer.querySelectorAll('input');
        const firstQuizTryAgainButtonAfter = Array.from(firstQuizContainer.querySelectorAll('button')).find(b => b.textContent === 'Try Again');

        expect(firstQuizResultElementAfter).not.toBeUndefined();
        expect(firstQuizTryAgainButtonAfter).not.toBeUndefined();
        firstQuizInputsAfter.forEach(input => expect(input.disabled).toBe(true));
    });
});