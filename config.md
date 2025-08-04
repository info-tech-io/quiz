# Quiz Engine Configurations

This document describes all possible configurations for the `config` object within `quiz-data.json` files. The quiz engine (`quiz-engine.js`) uses these parameters to determine the type and behavior of the displayed quiz.

---

### Important Note on Multilingual Support

With the implementation of internationalization (i18n), the structure of fields containing user-facing text has changed. The fields `question`, `answers.text`, `answers.description`, and `explanation` must now be objects where the key is the language code.

**Example:**
```json
"question": {
  "ru": "Вопрос на русском",
  "en": "Question in English"
}
```
If a text does not require translation (e.g., the answer option `<h1>`), it is still recommended to format it as an object for consistency:
```json
"text": {
  "ru": "<h1>",
  "en": "<h1>"
}
```
The engine will automatically select the appropriate string based on the detected language.

---

### 1. Type: Single Choice Quiz

**Common Parameters:**
-   `type: "single-choice"` (required)
-   `showExplanation`:
    -   `"none"`: Do not show explanations.
    -   `"selected"`: Show the explanation for the selected answer.
    -   `"all"`: Show all explanations.

**Configuration Example:**
```json
{
  "config": {
    "type": "single-choice",
    "showExplanation": "all"
  },
  "question": {
    "ru": "Какой тег самый важный?",
    "en": "Which tag is most important?"
  },
  "answers": [
    {
      "text": { "ru": "<h1>", "en": "<h1>" },
      "correct": true,
      "description": { "ru": "Верно!", "en": "Correct!" }
    },
    {
      "text": { "ru": "<h6>", "en": "<h6>" },
      "correct": false,
      "description": { "ru": "Неверно.", "en": "Incorrect." }
    }
  ]
}
```

---

### 2. Type: Multiple Choice Quiz

**Common Parameters:**
-   `type: "multiple-choice"` (required)
-   `showExplanation`: (same values as for `single-choice`)

**Configuration Example:**
```json
{
  "config": {
    "type": "multiple-choice",
    "showExplanation": "all"
  },
  "question": {
    "ru": "Какие теги блочные?",
    "en": "Which tags are block-level elements?"
  },
  "answers": [
    {
      "text": { "ru": "<div>", "en": "<div>" },
      "correct": true,
      "description": { "ru": "Верно", "en": "Correct" }
    },
    {
      "text": { "ru": "<span>", "en": "<span>" },
      "correct": false,
      "description": { "ru": "Неверно", "en": "Incorrect" }
    }
  ]
}
```

---

### 3. Type: Input Field Quiz

**Common Parameters:**
-   `type: "input-field"` (required)
-   `caseSensitive`:
    -   `true`: The check is case-sensitive.
    -   `false`: The check is case-insensitive.
-   `showExplanationOnError`:
    -   `true`: Show the correct answer on error.
    -   `false`: Do not show.

**Configuration Example:**
```json
{
  "config": {
    "type": "input-field",
    "caseSensitive": false,
    "showExplanationOnError": true
  },
  "question": {
    "ru": "Какой язык используется для стилей?",
    "en": "Which language is used for styling?"
  },
  "answer": "CSS",
  "explanation": {
    "ru": "Правильный ответ: CSS",
    "en": "The correct answer is: CSS"
  }
}
```
