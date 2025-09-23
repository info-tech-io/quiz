---
title: "Getting Started with Quiz Engine"
description: "Learn how to integrate and use Quiz Engine in your educational projects"
weight: 10
---

# Getting Started with Quiz Engine

Quiz Engine is a flexible, multilingual JavaScript library for creating interactive educational tests and quizzes. It's designed to be simple to integrate while providing powerful features for educational content creators.

## Quick Start

### 1. Installation

#### CDN (Recommended for quick start)
```html
<script src="https://cdn.jsdelivr.net/npm/@info-tech/quiz-engine@latest/dist/quiz-engine.min.js"></script>
```

#### NPM Installation
```bash
npm install @info-tech/quiz-engine
```

#### Download and Host
Download the latest release from our [GitHub repository](https://github.com/info-tech-io/quiz) and host the files on your server.

### 2. Basic HTML Setup

Create a simple HTML page with a quiz container:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Quiz</title>
    <link rel="stylesheet" href="path/to/quiz-engine.css">
</head>
<body>
    <h1>Welcome to My Quiz</h1>

    <!-- Quiz Container -->
    <div class="quiz-container" data-quiz-src="my-first-quiz.json"></div>

    <!-- Quiz Engine Script -->
    <script src="path/to/quiz-engine.js"></script>
</body>
</html>
```

### 3. Create Your First Quiz

Create a JSON file called `my-first-quiz.json`:

```json
{
  "config": {
    "type": "single-choice",
    "showExplanation": "all"
  },
  "question": {
    "en": "What is the capital of France?",
    "ru": "Какая столица Франции?"
  },
  "answers": [
    {
      "text": {
        "en": "Paris",
        "ru": "Париж"
      },
      "correct": true,
      "description": {
        "en": "Correct! Paris is the capital and largest city of France.",
        "ru": "Правильно! Париж — столица и крупнейший город Франции."
      }
    },
    {
      "text": {
        "en": "London",
        "ru": "Лондон"
      },
      "correct": false,
      "description": {
        "en": "Incorrect. London is the capital of the United Kingdom.",
        "ru": "Неверно. Лондон — столица Великобритании."
      }
    },
    {
      "text": {
        "en": "Berlin",
        "ru": "Берлин"
      },
      "correct": false,
      "description": {
        "en": "Incorrect. Berlin is the capital of Germany.",
        "ru": "Неверно. Берлин — столица Германии."
      }
    }
  ]
}
```

### 4. Test Your Quiz

Open your HTML file in a web browser. You should see:
- The quiz question displayed in the browser's default language
- Multiple choice answers
- Interactive feedback when answers are selected
- Explanations for correct and incorrect answers

## Key Features

### 🌍 Multilingual Support
- Automatic language detection from browser settings
- URL parameter language switching (`?lang=en` or `?lang=ru`)
- Support for custom language definitions

### 🎯 Multiple Question Types
- **Single Choice**: One correct answer from multiple options
- **Multiple Choice**: Multiple correct answers possible
- **Text Input**: Free text answers with flexible matching
- **True/False**: Simple binary questions

### ⚙️ Flexible Configuration
- Show/hide explanations
- Custom scoring systems
- Time limits (coming soon)
- Progress tracking (coming soon)

### 🧪 Well Tested
- Comprehensive test suite with Jest
- Cross-browser compatibility
- Accessibility compliance

## What's Next?

- [Configuration Guide](/quiz/user-guide/configuration/) - Learn about all available options
- [Question Types](/quiz/user-guide/question-types/) - Explore different quiz formats
- [API Reference](/quiz/developer/api/) - Integrate Quiz Engine programmatically
- [Contributing](/quiz/contributing/) - Help improve Quiz Engine

## Need Help?

- [Examples](/quiz/examples/) - See Quiz Engine in action
- [FAQ](/quiz/faq/) - Common questions and answers
- [GitHub Issues](https://github.com/info-tech-io/quiz/issues) - Report bugs or request features
- [Discussions](https://github.com/info-tech-io/quiz/discussions) - Community support

---

**Ready to create more advanced quizzes?** Check out our [Configuration Guide](/quiz/user-guide/configuration/) to learn about all the customization options available.