// src/quiz-engine/config.js

export const config = {
    // Language settings
    supportedLanguages: ['en', 'ru'],
    defaultLanguage: 'en',

    // Paths
    localesPath: '/src/quiz-engine/locales/',

    // Selectors
    quizContainerSelector: '.quiz-container',

    // Default styles (will be moved to a separate file later)
    styles: {
        correctColor: 'green',
        incorrectColor: 'red',
        tryAgainMargin: '10px',
        messageMarginTop: '10px',
        messageDisplay: 'flex',
        messageAlignItems: 'center',
        resultMargin: '0'
    }
};
