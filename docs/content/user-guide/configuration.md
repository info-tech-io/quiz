---
title: "Configuration"
description: "Complete reference for Quiz Engine configuration options"
weight: 21
---

# Configuration Reference

Quiz Engine behavior is controlled through the `config` object in your quiz JSON files. This page describes all available configuration options.

## Basic Configuration Structure

```json
{
  "config": {
    "type": "single-choice",
    "showExplanation": "all",
    "shuffleAnswers": false,
    "allowRetry": true,
    "showProgress": true
  },
  "question": { /* ... */ },
  "answers": [ /* ... */ ]
}
```

## Configuration Options

### type
**Type:** `string`
**Required:** Yes
**Default:** `"single-choice"`

Determines the quiz question type.

**Available values:**
- `"single-choice"` - One correct answer from multiple options
- `"multiple-choice"` - Multiple correct answers possible
- `"text-input"` - Free text input with answer matching
- `"true-false"` - Simple true/false question

**Example:**
```json
{
  "config": {
    "type": "multiple-choice"
  }
}
```

### showExplanation
**Type:** `string`
**Default:** `"all"`

Controls when explanations are displayed to users.

**Available values:**
- `"all"` - Show explanations for all answers
- `"correct"` - Show explanations only for correct answers
- `"incorrect"` - Show explanations only for incorrect answers
- `"none"` - Never show explanations

**Example:**
```json
{
  "config": {
    "showExplanation": "correct"
  }
}
```

### shuffleAnswers
**Type:** `boolean`
**Default:** `false`

When `true`, randomizes the order of answer options each time the quiz loads.

**Example:**
```json
{
  "config": {
    "shuffleAnswers": true
  }
}
```

### allowRetry
**Type:** `boolean`
**Default:** `true`

Allows users to retry the quiz after completion.

**Example:**
```json
{
  "config": {
    "allowRetry": false
  }
}
```

### showProgress
**Type:** `boolean`
**Default:** `false`

Shows progress indicators for multi-question quizzes.

**Example:**
```json
{
  "config": {
    "showProgress": true
  }
}
```

### timeLimit
**Type:** `number`
**Default:** `null`

Sets a time limit in seconds for completing the quiz. When time expires, the quiz auto-submits.

**Example:**
```json
{
  "config": {
    "timeLimit": 300
  }
}
```

### passingScore
**Type:** `number`
**Default:** `70`

Percentage score required to pass the quiz (0-100).

**Example:**
```json
{
  "config": {
    "passingScore": 80
  }
}
```

### maxAttempts
**Type:** `number`
**Default:** `null`

Maximum number of attempts allowed. `null` means unlimited attempts.

**Example:**
```json
{
  "config": {
    "maxAttempts": 3
  }
}
```

## Text Input Configuration

For `text-input` type quizzes, additional configuration options are available:

### caseSensitive
**Type:** `boolean`
**Default:** `false`

Controls whether text matching is case-sensitive.

### exactMatch
**Type:** `boolean`
**Default:** `false`

When `true`, requires exact string matching. When `false`, allows partial matches.

### acceptableAnswers
**Type:** `array`
**Default:** `[]`

Array of acceptable answer variations for text input questions.

**Example:**
```json
{
  "config": {
    "type": "text-input",
    "caseSensitive": false,
    "exactMatch": false,
    "acceptableAnswers": ["Paris", "paris", "PARIS"]
  }
}
```

## Styling Configuration

### theme
**Type:** `string`
**Default:** `"default"`

Applies a predefined theme to the quiz.

**Available themes:**
- `"default"` - Standard Quiz Engine styling
- `"minimal"` - Clean, minimal design
- `"dark"` - Dark mode theme
- `"academic"` - Traditional academic styling

**Example:**
```json
{
  "config": {
    "theme": "dark"
  }
}
```

### customCSS
**Type:** `string`
**Default:** `null`

Path to a custom CSS file for styling the quiz.

**Example:**
```json
{
  "config": {
    "customCSS": "/css/my-quiz-styles.css"
  }
}
```

## Complete Example

Here's a comprehensive configuration example:

```json
{
  "config": {
    "type": "multiple-choice",
    "showExplanation": "all",
    "shuffleAnswers": true,
    "allowRetry": true,
    "showProgress": true,
    "timeLimit": 600,
    "passingScore": 75,
    "maxAttempts": 2,
    "theme": "academic"
  },
  "question": {
    "en": "Which of the following are programming languages?",
    "ru": "Какие из следующих являются языками программирования?"
  },
  "answers": [
    {
      "text": {
        "en": "JavaScript",
        "ru": "JavaScript"
      },
      "correct": true,
      "description": {
        "en": "Correct! JavaScript is a popular programming language.",
        "ru": "Правильно! JavaScript — популярный язык программирования."
      }
    },
    {
      "text": {
        "en": "HTML",
        "ru": "HTML"
      },
      "correct": false,
      "description": {
        "en": "HTML is a markup language, not a programming language.",
        "ru": "HTML — это язык разметки, а не язык программирования."
      }
    },
    {
      "text": {
        "en": "Python",
        "ru": "Python"
      },
      "correct": true,
      "description": {
        "en": "Correct! Python is a versatile programming language.",
        "ru": "Правильно! Python — универсальный язык программирования."
      }
    }
  ]
}
```

## Validation

Quiz Engine automatically validates your configuration and will display helpful error messages for:
- Invalid configuration values
- Missing required fields
- Incompatible option combinations

Check your browser's developer console for validation messages during development.