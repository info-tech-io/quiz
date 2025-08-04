# Functional Requirements for the Quiz Template System

This document describes the functional requirements for the collection of interactive quiz templates.

## 1. General (Global) Requirements

-   **1.1. Separation of Data and Logic**: The system **must** separate the display and validation logic (JavaScript) from the quiz content (JSON).
-   **1.2. Client-Side**: All templates **must** operate exclusively on the client-side (in the browser).
-   **1.3. Web Server Requirement**: To ensure the correct functioning of the JSON file loading mechanism (`fetch` API), the system requires being run via a local web server.
-   **1.4. Post-Answer Locking**: After the user clicks the "Check Answer" button, the system **must** perform the following actions:
    -   The "Check Answer" button **must** disappear.
    -   All input controls (radio buttons, checkboxes, text fields) **must** be disabled (`disabled`).

## 2. Internationalization (i18n) Requirements

-   **2.1. Language Detection**: The system **must** detect the user's language in the following order of priority:
    1.  From the `lang` parameter in the URL (e.g., `?lang=en`). Supported values: `ru`, `en`.
    2.  From the user's browser language settings (`navigator.language`).
    3.  If the language is not detected or not supported, the default language, English (`en`), **must** be used.
-   **2.2. UI Localization**:
    -   All UI strings (button text, result messages, error messages) **must** be stored in separate JSON files in the `quiz-engine/locales/` directory (e.g., `ru.json`, `en.json`).
    -   The engine **must** load the appropriate localization file before building the quiz.
-   **2.3. Content Localization**:
    -   All text fields in the `quiz-data.json` file intended for user display (`question`, `answers.text`, `answers.description`, `explanation`) **must** support multilingualism.
    -   These fields **must** be objects where the key is a language code (e.g., `ru`, `en`) and the value is the string in that language.
    -   Example: `"question": { "ru": "Вопрос", "en": "Question" }`.

## 3. Quiz Type Requirements

### 3.1. Single Choice Quiz

-   **3.1.1. Core Functionality**:
    -   Radio buttons (`<input type="radio">`) **must** be used for answer selection.
    -   An answer is considered correct if the `correct` field for the selected option in `quiz-data.json` is `true`.
-   **3.1.2. Extension (Show Explanations)**:
    -   The configuration **must** be controlled by the `showExplanation` parameter in the `config` object of `quiz-data.json`.
    -   `"selected"`: After checking, display the `description` for the user's selected option only.
    -   `"all"`: After checking, display the `description` for **each** answer option.

### 3.2. Multiple Choice Quiz

-   **3.2.1. Core Functionality**:
    -   Checkboxes (`<input type="checkbox">`) **must** be used for answer selection.
    -   An answer is considered correct **only if** the set of user-selected options exactly matches the set of all options where the `correct` field is `true`.
-   **3.2.2. Extension (Show Explanations)**: Same as the single-choice quiz, controlled by the `showExplanation` parameter.

### 3.3. Input Field Quiz

-   **3.3.1. General**: Before validation, the system **must** trim leading and trailing whitespace from the user's input string.
-   **3.3.2. Configuration**: The behavior **must** be controlled by parameters in the `config` object of `quiz-data.json`:
    -   `caseSensitive: true`: The comparison with the `answer` standard is **case-sensitive**.
    -   `caseSensitive: false`: The comparison is **case-insensitive**.
    -   `showExplanationOnError: true`: If the user's answer is incorrect, display the text from the `explanation` field.
