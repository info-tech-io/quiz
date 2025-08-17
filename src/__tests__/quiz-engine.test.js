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
    // Simulate adding a radio button and its container for explanation
    const answerOptionDiv = document.createElement('div');
    answerOptionDiv.className = 'answer-option'; // Or whatever class is used

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `quiz-${instanceId}-answer`;
    input.id = `quiz-${instanceId}-answer-0`;
    answerOptionDiv.appendChild(input);

    // Add a dummy label for completeness, though not strictly needed for this test
    const label = document.createElement('label');
    label.setAttribute('for', input.id);
    label.textContent = 'Mock Answer'; // Placeholder
    answerOptionDiv.appendChild(label);

    // This is the crucial part: the container for the explanation
    const explanationContainer = document.createElement('div');
    explanationContainer.id = `quiz-${instanceId}-answer-container-0`;
    answerOptionDiv.appendChild(explanationContainer);

    form.appendChild(answerOptionDiv);
  }),
  checkAnswer: vi.fn((form, data, lang, instanceId) => {
    // Simulate showing the explanation for the first answer (assuming it's correct)
    const explanationContainer = document.querySelector(`#quiz-${instanceId}-answer-container-0`);
    if (explanationContainer) {
      const p = document.createElement('p');
      // Get the translated description from data.answers[0].description
      const translatedDescription = data.answers[0].description[lang] || data.answers[0].description.en; // Fallback to English
      p.textContent = translatedDescription;
      explanationContainer.appendChild(p);
    }
    return true; // Indicate correct answer
  }),
}));

vi.mock('../quiz-engine/quiz-types/multiple-choice.js', () => ({
  buildUI: vi.fn((form, data, lang, ui, instanceId) => {
    // Simulate adding a checkbox for multiple-choice
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = `quiz-${instanceId}-answer`;
    input.id = `quiz-${instanceId}-answer-0`;
    form.appendChild(input);
  }),
  checkAnswer: vi.fn(() => true),
}));

vi.mock('../quiz-engine/quiz-types/input-field.js', () => ({
  buildUI: vi.fn((form, data, lang, ui, instanceId) => {
    // Simulate adding a text input field
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `quiz-${instanceId}-answer-input`;
    form.appendChild(input);
  }),
  checkAnswer: vi.fn(() => true),
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
