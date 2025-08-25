# Описание конфигураций для quiz-engine.js

Этот документ описывает все возможные конфигурации для объекта `config` в файлах `quiz-data.json`. "Движок" (`quiz-engine.js`) использует эти параметры для определения типа и поведения отображаемого теста.

---

### Важное замечание о мультиязычности

С внедрением интернационализации (i18n) структура полей, содержащих текст для пользователя, изменилась. Поля `question`, `answers.text`, `answers.description` и `explanation` теперь должны быть объектами, где ключ — это код языка.

**Пример:**
```json
"question": {
  "ru": "Вопрос на русском",
  "en": "Question in English"
}
```
Если текст не требует перевода (например, в варианте ответа `<h1>`), его все равно рекомендуется оформлять в виде объекта для единообразия:
```json
"text": {
  "ru": "<h1>",
  "en": "<h1>"
}
```
Движок автоматически выберет нужную строку в зависимости от определенного языка.

---

### 1. Тип: Тест с одним правильным ответом (`single-choice`)

**Общие параметры:**
-   `type: "single-choice"` (обязательный)
-   `showExplanation`:
    -   `"none"`: Не показывать объяснения.
    -   `"selected"`: Показать объяснение для выбранного ответа.
    -   `"all"`: Показать все объяснения.

**Пример конфигурации:**
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

### 2. Тип: Тест с несколькими правильными ответами (`multiple-choice`)

**Общие параметры:**
-   `type: "multiple-choice"` (обязательный)
-   `showExplanation`: (те же значения, что и у `single-choice`)

**Пример конфигурации:**
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

### 3. Тип: Тест с полем для ввода ответа (`input-field`)

**Общие параметры:**
-   `type: "input-field"` (обязательный)
-   `caseSensitive`:
    -   `true`: Проверка чувствительна к регистру.
    -   `false`: Проверка нечувствительна к регистру.
-   `showExplanationOnError`:
    -   `true`: Показать правильный ответ при ошибке.
    -   `false`: Не показывать.

**Пример конфигурации:**
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

---

### 4. Глобальные параметры

Эти параметры могут быть добавлены в `config` любого типа для изменения общего поведения.

-   `showTryAgainButton`:
    -   `true`: Показать кнопку "Попробовать снова" после неверного ответа.
    -   `false` (по умолчанию): Не показывать кнопку.

**Пример использования:**
```json
{
  "config": {
    "type": "single-choice",
    "showExplanation": "selected",
    "showTryAgainButton": true
  },
  ...
}
```
Эта конфигурация создаст тест с одним вариантом ответа, покажет объяснение для выбранного пользователем варианта и отобразит кнопку для повторной попытки в случае ошибки.
