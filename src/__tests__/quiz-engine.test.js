// __tests__/quiz-engine.test.js

const fs = require('fs');
const path = require('path');

// --- Mocks and Helpers ---

let urlGetSpy;

beforeEach(() => {
    // Spy on the 'get' method of URLSearchParams prototype
    urlGetSpy = jest.spyOn(URLSearchParams.prototype, 'get');
});

afterEach(() => {
    // Restore the original method after each test
    urlGetSpy.mockRestore();
});

// Main helper to initialize a quiz
const initQuiz = (quizFileName, lang = 'ru') => {
    // Mock the return value of 'get' specifically for the 'lang' parameter
    urlGetSpy.mockImplementation(param => {
        if (param === 'lang') {
            return lang;
        }
        return null;
    });

    // Set up DOM
    const html = `<div class="quiz-container" data-quiz-src="${quizFileName}"></div>`;
    document.body.innerHTML = html;

    // Mock fetch to handle both quiz data and locale files
    global.fetch = jest.fn((url) => {
        let filePath;
        if (url.startsWith('/src/quiz-engine/locales/')) {
             // The URL is root-relative, so we resolve it from the project root.
             // __dirname is .../src/__tests__, so project root is two levels up.
             filePath = path.resolve(__dirname, '../..', url.substring(1));
        } else if (url.includes('.json')) {
            // This handles the quiz data files, which are not root-relative in the test setup.
            filePath = path.resolve(__dirname, '../../quiz-examples', url);
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

    // Isolate module loading to ensure a clean start for each test
    jest.isolateModules(() => {
        require('../quiz-engine/quiz-engine.js');
    });

    // Trigger the engine
    document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
};


// --- Test Suites ---

describe('Quiz Engine - Internationalization (i18n)', () => {

    test('должен отображать русский интерфейс по умолчанию', async () => {
        initQuiz('sc-base.json', 'ru');
        await new Promise(process.nextTick);

        const checkButton = document.querySelector('button');
        expect(checkButton.textContent).toBe('Проверить ответ');
    });

    test('должен отображать английский интерфейс при lang=en', async () => {
        initQuiz('sc-base.json', 'en');
        await new Promise(process.nextTick);

        const checkButton = document.querySelector('button');
        expect(checkButton.textContent).toBe('Check Answer');
    });

    test('должен отображать переведенный контент вопроса', async () => {
        initQuiz('sc-extension-mod.json', 'en');
        await new Promise(process.nextTick);

        const question = document.querySelector('h2');
        expect(question.textContent).toBe('Which tag is the most important?');
    });

    test('должен отображать переведенное объяснение', async () => {
        initQuiz('sc-extension-mod.json', 'en');
        await new Promise(process.nextTick);

        document.querySelector('input[value="0"]').click();
        document.querySelector('button').click();

        const desc = document.querySelector('#answer-container-0 p');
        expect(desc.textContent).toBe('Correct, h1 is the most important.');
    });
});


describe('Quiz Engine - Core Logic (with i18n)', () => {

    test('должен показать "Правильно!" при выборе верного ответа', async () => {
        initQuiz('sc-base.json', 'ru');
        await new Promise(process.nextTick);

        document.querySelector('input[value="0"]').click();
        document.querySelector('button').click();

        const resultElement = document.querySelector('div > p');
        expect(resultElement.textContent).toBe('Правильно!');
        expect(resultElement.style.color).toBe('green');
    });

    test('должен показать "Неправильно." при выборе неверного ответа', async () => {
        initQuiz('sc-base.json', 'ru');
        await new Promise(process.nextTick);

        document.querySelector('input[value="1"]').click();
        document.querySelector('button').click();

        const resultElement = document.querySelector('div > p');
        expect(resultElement.textContent).toBe('Неправильно.');
    });

    test('должен показать "Правильно!" для multiple-choice', async () => {
        initQuiz('mc-base.json', 'ru');
        await new Promise(process.nextTick);

        document.querySelector('input[value="0"]').click();
        document.querySelector('input[value="2"]').click();
        document.querySelector('button').click();

        const resultElement = document.querySelector('div > p');
        expect(resultElement.textContent).toBe('Правильно!');
    });

    test('должен показать "Правильно!" для case-insensitive input', async () => {
        initQuiz('if-mod.json', 'ru');
        await new Promise(process.nextTick);

        const input = document.querySelector('input[type="text"]');
        input.value = 'cSS';
        document.querySelector('button').click();

        const resultElement = document.querySelector('div > p');
        expect(resultElement.textContent).toBe('Правильно!');
    });

    test('должен показать объяснение на русском при неверном ответе', async () => {
        initQuiz('if-mod-extension.json', 'ru');
        await new Promise(process.nextTick);

        document.querySelector('input[type="text"]').value = 'wrong';
        document.querySelector('button').click();

        const explanationElement = document.querySelector('div > p');
        expect(explanationElement.textContent).toBe('Правильный ответ: CSS.');
    });
});

describe('Quiz Engine - Multi-Quiz Isolation', () => {

    // Helper to initialize multiple quizzes on the same page
    const initMultipleQuizzes = (quizFiles, lang = 'ru') => {
        urlGetSpy.mockImplementation(param => {
            if (param === 'lang') return lang;
            return null;
        });

        // Set up DOM with multiple containers
        document.body.innerHTML = quizFiles
            .map(file => `<div class="quiz-container" data-quiz-src="${file}"></div>`)
            .join('<hr>');

        // Mock fetch once for all quizzes
        global.fetch = jest.fn((url) => {
            let filePath;
            if (url.startsWith('/src/quiz-engine/locales/')) {
                 filePath = path.resolve(__dirname, '../..', url.substring(1));
            } else if (url.includes('.json')) {
                filePath = path.resolve(__dirname, '../../quiz-examples', url);
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

        // Isolate and trigger the engine
        jest.isolateModules(() => {
            require('../quiz-engine/quiz-engine.js');
        });
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
    };

    test('должен изолировать логику объяснений между несколькими квизами', async () => {
        initMultipleQuizzes(['sc-base.json', 'sc-extension.json'], 'ru');
        await new Promise(process.nextTick); // Wait for quizzes to render

        const quizContainers = document.querySelectorAll('.quiz-container');
        const firstQuizContainer = quizContainers[0];
        const secondQuizContainer = quizContainers[1];

        // Action: Select an answer and check it in the *second* quiz
        const secondQuizRadioButton = secondQuizContainer.querySelector('input[value="0"]');
        const secondQuizCheckButton = secondQuizContainer.querySelector('button');

        secondQuizRadioButton.click();
        secondQuizCheckButton.click();
        await new Promise(process.nextTick); // Wait for explanation to be processed

        // Assertion 1: The first quiz should NOT have any explanation text
        const firstQuizExplanation = firstQuizContainer.querySelector('p.explanation-text'); // Assuming a class for easier selection
        expect(firstQuizExplanation).toBeNull();

        // Assertion 2: The second quiz SHOULD have an explanation for the selected answer
        const secondQuizExplanation = secondQuizContainer.querySelector('#answer-container-0 p');
        expect(secondQuizExplanation).not.toBeNull();
        expect(secondQuizExplanation.textContent).toContain('h1 — самый важный тег');
    });
});
