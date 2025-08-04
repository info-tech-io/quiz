# Unified Quiz Engine for Interactive Test Assignments

This document describes how to use the unified `quiz-engine.js` to create interactive test assignments. This approach replaces the use of separate scripts for each test type, providing a centralized, flexible, and multilingual way to manage quizzes.

## Key Features

-   **Centralized Logic**: All logic resides in a single file, `quiz-engine.js`.
-   **JSON-based Configuration**: The behavior of each quiz is configured within its data file.
-   **Multiple Quiz Types Support**: Single choice, multiple choice, and text input.
-   **Internationalization (i18n)**: Full support for multiple languages (RU/EN) for both the UI and the content.
-   **Reliability**: The code is covered by automated tests using Jest.

## How to Use

### 1. Include the Script

Include the `quiz-engine.js` script in your HTML page, preferably at the end of the `<body>` tag.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Lesson with Quizzes</title>
</head>
<body>
    <!-- Your lesson content -->

    <h3>Quiz #1</h3>
    <div class="quiz-container" data-quiz-src="/quiz-examples/sc-extension-mod.json"></div>

    <h3>Quiz #2 (in Russian)</h3>
    <div class="quiz-container" data-quiz-src="/quiz-examples/if-mod-extension.json"></div>

    <!-- Include the engine -->
    <script src="/quiz-engine/quiz-engine.js"></script>
</body>
</html>
```

### 2. Insert the Quiz in HTML

To insert a quiz at the desired location on the page, use the following HTML snippet:

```html
<div class="quiz-container" data-quiz-src="path/to/quiz-data.json"></div>
```

-   `class="quiz-container"`: A mandatory class that the engine uses to find where to insert the quiz.
-   `data-quiz-src`: An attribute containing the path to the JSON file with the data and configuration for this specific quiz.

### 3. Language Management

The engine automatically detects the language in the following order:
1.  **URL Parameter**: `?lang=en` or `?lang=ru`. This allows creating direct links to a specific language version of a quiz.
2.  **Browser Language**: If the URL parameter is absent, the browser's language is used.
3.  **Default Language**: If the browser's language is not supported, English (`en`) is used.

### 4. Create the Quiz Data File (`quiz-data.json`)

This is the main step. You create a JSON file that contains both the quiz configuration and its multilingual content.

**Example of a multilingual `quiz-data.json`:**
```json
{
  "config": {
    "type": "single-choice",
    "showExplanation": "all"
  },
  "question": {
    "ru": "Какой тег является самым важным?",
    "en": "Which tag is the most important?"
  },
  "answers": [
    {
      "text": { "ru": "<h1>", "en": "<h1>" },
      "correct": true,
      "description": {
        "ru": "Верно, h1 - самый важный.",
        "en": "Correct, h1 is the most important."
      }
    },
    {
      "text": { "ru": "<h6>", "en": "<h6>" },
      "correct": false,
      "description": {
        "ru": "Неверно, h6 - наименее важный.",
        "en": "Incorrect, h6 is the least important."
      }
    }
  ]
}
```

For a full description of all possible types and configuration parameters, see the [**config.md**](./config.md) file.

## Testing

The project is set up for automated testing with Jest.
-   Test scenarios are located in `__tests__/quiz-engine.test.js`.
-   Test data (mock files) are in `quiz-examples/`.

To run all tests, execute the command:
```bash
npm test
```
