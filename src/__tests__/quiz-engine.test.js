// __tests__/quiz-engine.test.js

const fs = require('fs');
const path = require('path');

// --- Mocks and Helpers ---

let urlGetSpy;

// This function is called before each test to reset the environment
beforeEach(() => {
    // Spy on the 'get' method of URLSearchParams prototype
    urlGetSpy = jest.spyOn(URLSearchParams.prototype, 'get');
    
    // Reset the DOM
    document.body.innerHTML = '';

    // Reset Jest's module registry to ensure the quiz engine script is re-executed
    jest.resetModules();
});

afterEach(() => {
    // Restore the original method after each test
    urlGetSpy.mockRestore();
});

// Main helper to initialize a single quiz
const initQuiz = (quizFileName, lang = 'ru') => {
    // Mock the return value of 'get' for the 'lang' parameter
    urlGetSpy.mockImplementation(param => (param === 'lang' ? lang : null));

    // Set up DOM for a single quiz
    document.body.innerHTML = `<div class="quiz-container" data-quiz-src="${quizFileName}"></div>`;

    // Mock fetch to handle both quiz data and locale files
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

    // Load and execute the quiz engine script
    require('../quiz-engine/quiz-engine.js');

    // Trigger the DOMContentLoaded event to run the engine
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

        // Since this is the first (and only) quiz, its ID is 1
        document.querySelector('#quiz-1-answer-0').click();
        document.querySelector('button').click();
        await new Promise(process.nextTick);

        const desc = document.querySelector('#quiz-1-answer-container-0 p');
        expect(desc.textContent).toBe('Correct, h1 is the most important.');
    });
});


describe('Quiz Engine - Core Logic (with i18n)', () => {

    test('должен показать "Правильно!" при выборе верного ответа', async () => {
        initQuiz('sc-base.json', 'ru');
        await new Promise(process.nextTick);

        document.querySelector('#quiz-1-answer-0').click();
        document.querySelector('button').click();

        const resultElement = document.querySelector('div > p');
        expect(resultElement.textContent).toBe('Правильно!');
        expect(resultElement.style.color).toBe('green');
    });

    test('должен показать "Неправильно." при выборе неверного ответа', async () => {
        initQuiz('sc-base.json', 'ru');
        await new Promise(process.nextTick);

        document.querySelector('#quiz-1-answer-1').click();
        document.querySelector('button').click();

        const resultElement = document.querySelector('div > p');
        expect(resultElement.textContent).toBe('Неправильно.');
    });

    test('должен показать "Правильно!" для multiple-choice', async () => {
        initQuiz('mc-base.json', 'ru');
        await new Promise(process.nextTick);

        document.querySelector('#quiz-1-answer-0').click();
        document.querySelector('#quiz-1-answer-2').click();
        document.querySelector('button').click();

        const resultElement = document.querySelector('div > p');
        expect(resultElement.textContent).toBe('Правильно!');
    });

    test('должен показать "Правильно!" для case-insensitive input', async () => {
        initQuiz('if-mod.json', 'ru');
        await new Promise(process.nextTick);

        const input = document.querySelector('#quiz-1-answer-input');
        input.value = 'cSS';
        document.querySelector('button').click();

        const resultElement = document.querySelector('div > p');
        expect(resultElement.textContent).toBe('Правильно!');
    });

    test('должен показать объяснение на русском при неверном ответе', async () => {
        initQuiz('if-mod-extension.json', 'ru');
        await new Promise(process.nextTick);

        document.querySelector('#quiz-1-answer-input').value = 'wrong';
        document.querySelector('button').click();

        const explanationElement = document.querySelector('div > p');
        expect(explanationElement.textContent).toBe('Правильный ответ: CSS.');
    });

    describe('"Попробовать снова" button', () => {
        test('должна появляться при неверном ответе и сбрасывать квиз', async () => {
            initQuiz('sc-base.json', 'ru');
            await new Promise(process.nextTick);
    
            const quizContainer = document.querySelector('.quiz-container');
            
            // 1. Give an INCORRECT answer and check
            quizContainer.querySelector('#quiz-1-answer-1').click(); // Incorrect answer
            quizContainer.querySelector('button[type="button"]').click();
            await new Promise(process.nextTick);
    
            // 2. Verify "Try Again" button appears
            const allButtons = quizContainer.querySelectorAll('button');
            const tryAgainButton = Array.from(allButtons).find(btn => btn.textContent === 'Попробовать снова');
            expect(tryAgainButton).not.toBeNull();
    
            // 3. Click "Try Again"
            tryAgainButton.click();
            await new Promise(process.nextTick);
    
            // 4. Verify the quiz is reset
            const checkButton = quizContainer.querySelector('button');
            expect(checkButton).not.toBeNull();
            expect(checkButton.textContent).toBe('Проверить ответ');
            expect(checkButton.style.display).not.toBe('none');
    
            const inputs = quizContainer.querySelectorAll('input');
            expect(inputs[1].disabled).toBe(false);
            expect(inputs[1].checked).toBe(false);
    
            const resultMessage = quizContainer.querySelector('div > p');
            expect(resultMessage).toBeNull();
        });

        test('не должна появляться при верном ответе', async () => {
            initQuiz('sc-base.json', 'ru');
            await new Promise(process.nextTick);
    
            const quizContainer = document.querySelector('.quiz-container');
            
            // 1. Give a CORRECT answer and check
            quizContainer.querySelector('#quiz-1-answer-0').click(); // Correct answer
            quizContainer.querySelector('button[type="button"]').click();
            await new Promise(process.nextTick);
    
            // 2. Verify "Try Again" button does NOT appear
            const allButtons = quizContainer.querySelectorAll('button');
            const tryAgainButton = Array.from(allButtons).find(btn => btn.textContent === 'Попробовать снова');
            expect(tryAgainButton).toBeUndefined();
        });
    });
});

describe('Quiz Engine - Multi-Quiz Isolation', () => {

    // Helper to initialize multiple quizzes on the same page
    const initMultipleQuizzes = (quizFiles, lang = 'ru') => {
        urlGetSpy.mockImplementation(param => (param === 'lang' ? lang : null));

        document.body.innerHTML = quizFiles
            .map(file => `<div class="quiz-container" data-quiz-src="${file}"></div>`)
            .join('<hr>');

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

        require('../quiz-engine/quiz-engine.js');
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
    };

    test('должен изолировать логику объяснений между несколькими квизами', async () => {
        initMultipleQuizzes(['sc-base.json', 'sc-extension.json'], 'ru');
        await new Promise(process.nextTick);

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
        // We check for any <p> tag inside any answer container of the first quiz.
        const firstQuizExplanation = firstQuizContainer.querySelector('[id^="quiz-1-answer-container-"] p');
        expect(firstQuizExplanation).toBeNull();

        // Assertion 2: The second quiz SHOULD have an explanation for the selected answer.
        const secondQuizExplanation = secondQuizContainer.querySelector('#quiz-2-answer-container-0 p');
        expect(secondQuizExplanation).not.toBeNull();
        expect(secondQuizExplanation.textContent).toContain('Верно, h1 - самый важный.');
    });
});
