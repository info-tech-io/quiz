# Интеграция Quiz Engine в модули платформы

Этот документ описывает, как интегрировать Quiz Engine в учебные модули платформы InfoTech.io на базе Hugo.

## Обзор интеграции

Quiz Engine интегрируется в модули платформы через:
1. **Git submodule** - подключение Quiz Engine как подмодуля
2. **HTML контейнеры** - размещение квизов в контенте
3. **JavaScript загрузка** - инициализация движка на страницах

## Шаг 1: Подключение как Git Submodule

### 1.1. Добавление субмодуля

```bash
# Из корня вашего Hugo модуля
git submodule add -b main https://github.com/info-tech-io/quiz.git static/quiz
git submodule update --init --recursive

# Привязка к стабильной версии
cd static/quiz
git checkout v1.0.0
cd ../..
git add static/quiz
git commit -m "Add Quiz Engine v1.0.0 as submodule"
```

### 1.2. Создание .gitmodules

```ini
[submodule "static/quiz"]
	path = static/quiz
	url = https://github.com/info-tech-io/quiz.git
	branch = main
```

### 1.3. Обновление субмодуля

```bash
# При обновлении Quiz Engine до новой версии
cd static/quiz
git fetch --tags
git checkout v1.1.0  # новая версия
cd ../..
git add static/quiz
git commit -m "Update Quiz Engine to v1.1.0"
```

## Шаг 2: Размещение квизов в контенте

### 2.1. HTML контейнеры

В Markdown файлах используйте HTML контейнеры:

```html
<div class="quiz-container" data-quiz-src="/quiz/quiz-examples/sc-base.json"></div>
```

**Атрибуты контейнера:**
- `class="quiz-container"` - **обязательный** CSS класс для поиска движком
- `data-quiz-src="path/to/quiz.json"` - **обязательный** путь к JSON файлу с квизом

### 2.2. Путь к JSON файлам

Пути к JSON файлам должны быть относительно корня сайта:

```html
<!-- Примеры квизов из Quiz Engine -->
<div class="quiz-container" data-quiz-src="/quiz/quiz-examples/sc-base.json"></div>

<!-- Ваши собственные квизы -->
<div class="quiz-container" data-quiz-src="/static/my-quizzes/lesson-1.json"></div>
```

## Шаг 3: Инициализация JavaScript

### 3.1. Базовая инициализация

На страницах с квизами добавьте JavaScript:

```html
<script type="module">
  import { initializeQuizzes } from '/quiz/src/quiz-engine/quiz-engine.mjs';
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeQuizzes);
  } else {
    initializeQuizzes();
  }
</script>
```

### 3.2. Инициализация с логированием

```html
<script type="module">
  import { initializeQuizzes } from '/quiz/src/quiz-engine/quiz-engine.mjs';
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🎯 Инициализация Quiz Engine...');
      initializeQuizzes();
    });
  } else {
    console.log('🎯 Инициализация Quiz Engine...');
    initializeQuizzes();
  }
</script>
```

### 3.3. Условная загрузка (рекомендуется)

Для оптимизации загружайте Quiz Engine только на страницах с квизами:

```html
<!-- В Hugo шаблоне (если используется shortcode) -->
{{ if .HasShortcode "quiz" }}
  <script type="module" src="/quiz/src/quiz-engine/quiz-engine.mjs"></script>
{{ end }}

<!-- Или проверка наличия контейнеров -->
<script type="module">
  if (document.querySelector('.quiz-container')) {
    import('/quiz/src/quiz-engine/quiz-engine.mjs')
      .then(({ initializeQuizzes }) => {
        initializeQuizzes();
      });
  }
</script>
```

## Шаг 4: Создание квизов

### 4.1. Структура JSON файла

Каждый квиз - это JSON файл со следующей структурой:

```json
{
  "config": {
    "type": "single-choice",
    "showExplanation": "all"
  },
  "question": {
    "ru": "Какой тег самый важный в HTML?",
    "en": "Which tag is most important in HTML?"
  },
  "answers": [
    {
      "text": { "ru": "<h1>", "en": "<h1>" },
      "correct": true,
      "description": { "ru": "Верно! H1 - основной заголовок.", "en": "Correct! H1 is the main heading." }
    },
    {
      "text": { "ru": "<h6>", "en": "<h6>" },
      "correct": false,
      "description": { "ru": "Неверно. H6 - наименее важный заголовок.", "en": "Incorrect. H6 is the least important heading." }
    }
  ]
}
```

### 4.2. Типы квизов

**Single Choice (один правильный ответ):**
```json
{
  "config": { "type": "single-choice", "showExplanation": "selected" }
}
```

**Multiple Choice (несколько правильных ответов):**
```json
{
  "config": { "type": "multiple-choice", "showExplanation": "all" }
}
```

**Input Field (ввод текста):**
```json
{
  "config": { 
    "type": "input-field", 
    "caseSensitive": false,
    "showExplanationOnError": true
  },
  "question": { "ru": "Введите правильный ответ:", "en": "Enter the correct answer:" },
  "answer": "CSS",
  "explanation": { "ru": "Правильный ответ: CSS", "en": "The correct answer is: CSS" }
}
```

### 4.3. Конфигурация поведения

```json
{
  "config": {
    "type": "single-choice",
    "showExplanation": "selected",     // "none", "selected", "all"
    "showTryAgainButton": true         // показать кнопку "Попробовать снова"
  }
}
```

## Шаг 5: Интернационализация

### 5.1. Настройка языка

Quiz Engine автоматически определяет язык в порядке приоритета:
1. URL параметр `?lang=ru` или `?lang=en`
2. Язык браузера пользователя
3. Язык по умолчанию: **английский** (`en`)

### 5.2. Мультиязычный контент

Все текстовые поля должны содержать переводы:

```json
{
  "question": {
    "ru": "Текст на русском",
    "en": "Text in English"
  }
}
```

**Обязательные поля для перевода:**
- `question` - текст вопроса
- `answers[].text` - варианты ответов  
- `answers[].description` - объяснения к вариантам
- `explanation` - общее объяснение (для input-field)

## Шаг 6: Тестирование интеграции

### 6.1. Проверка файлов

```bash
# Проверьте наличие обязательных файлов
test -f static/quiz/src/quiz-engine/quiz-engine.mjs && echo "✅ Engine found"
test -f static/quiz/quiz-examples/sc-base.json && echo "✅ Examples found"

# Проверьте версию субмодуля
cd static/quiz && git describe --tags --exact-match
```

### 6.2. Проверка JSON квизов

```bash
# Валидация всех JSON файлов
find static -name "*.json" -type f | while read file; do
  if jq empty "$file" 2>/dev/null; then
    echo "✅ $file - valid JSON"
  else
    echo "❌ $file - invalid JSON"
  fi
done
```

### 6.3. Проверка сборки Hugo

```bash
# Сборка без ошибок
hugo --minify

# Проверка наличия Quiz Engine в собранном сайте
test -f public/quiz/src/quiz-engine/quiz-engine.mjs && echo "✅ Engine copied to public"

# Поиск quiz-container в HTML
grep -r "quiz-container" public/ && echo "✅ Quiz containers found in pages"
```

## Шаг 7: Готовые примеры

Quiz Engine включает 11 готовых примеров в папке `quiz-examples/`:

- **sc-base.json** - базовый single choice
- **sc-extension.json** - single choice с объяснениями
- **sc-extension-mod.json** - модифицированный вариант
- **mc-base.json** - базовый multiple choice
- **mc-extension.json** - multiple choice с объяснениями  
- **mc-extension-mod.json** - модифицированный вариант
- **if-base.json** - базовый input field
- **if-extension.json** - input field с объяснениями
- **if-mod.json** - модифицированный input field
- **if-mod-extension.json** - расширенный вариант
- **combined-example.json** - комбинированный пример

Используйте эти примеры как основу для создания собственных квизов.

## Устранение неполадок

### Квизы не загружаются

1. **Проверьте пути:** Убедитесь, что путь в `data-quiz-src` правильный
2. **Проверьте CORS:** Запускайте через веб-сервер, не через file://
3. **Проверьте консоль:** Откройте Developer Tools и найдите ошибки JavaScript

### Квизы не отображаются

1. **Проверьте CSS класс:** Контейнер должен иметь `class="quiz-container"`
2. **Проверьте инициализацию:** Убедитесь, что `initializeQuizzes()` вызывается
3. **Проверьте JSON:** Валидируйте синтаксис файлов квизов

### Проблемы с языком

1. **Проверьте config.js:** Язык по умолчанию установлен как `en`
2. **Проверьте переводы:** Все текстовые поля должны содержать нужный язык
3. **Проверьте locales:** Файлы `/quiz/src/quiz-engine/locales/ru.json` и `en.json` должны существовать

## Поддержка

- **Репозиторий:** https://github.com/info-tech-io/quiz
- **Документация:** `/docs/ru/` в репозитории
- **Примеры:** `/quiz-examples/` в репозитории
- **Версия:** v1.0.0 (стабильная)

---

*Документ создан на базе практического опыта интеграции Quiz Engine в hugo-base модуль платформы InfoTech.io*