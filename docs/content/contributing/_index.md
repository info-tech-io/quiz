---
title: "Contributing"
description: "How to contribute to Quiz Engine development"
weight: 40
---

# Contributing to Quiz Engine

We welcome contributions from developers of all skill levels! Quiz Engine is an open-source project that benefits from community involvement. Whether you're fixing bugs, adding features, improving documentation, or helping other users, your contributions are valuable.

## Quick Start for Contributors

### 1. Set Up Development Environment

```bash
# Clone the repository
git clone https://github.com/info-tech-io/quiz.git
cd quiz

# Install dependencies
npm install

# Run tests to ensure everything works
npm test

# Start development server
npm run dev
```

### 2. Make Your First Contribution

1. **Find an issue** to work on in our [GitHub Issues](https://github.com/info-tech-io/quiz/issues)
2. **Comment** on the issue to let others know you're working on it
3. **Fork** the repository and create a feature branch
4. **Make your changes** following our coding guidelines
5. **Test your changes** thoroughly
6. **Submit a pull request** with a clear description

## Ways to Contribute

### 🐛 Bug Reports
Found a bug? Please [create an issue](https://github.com/info-tech-io/quiz/issues/new/choose) with:
- Clear steps to reproduce
- Expected vs actual behavior
- Browser/environment details
- Minimal code example

### 💡 Feature Requests
Have an idea for improvement? We'd love to hear it! Please:
- Check existing issues first
- Describe the use case clearly
- Explain why it would benefit other users
- Consider implementation complexity

### 📝 Documentation
Help improve our documentation by:
- Fixing typos or unclear explanations
- Adding examples and tutorials
- Translating content to other languages
- Creating video tutorials or blog posts

### 🧪 Code Contributions
- **Bug fixes**: Small fixes are always welcome
- **New features**: Please discuss larger features in an issue first
- **Performance improvements**: Optimizations with benchmarks
- **Test coverage**: Help us reach 100% test coverage

### 🌍 Translations
Help make Quiz Engine accessible globally:
- Add new language translations
- Improve existing translations
- Review translation accuracy

## Development Guidelines

### Code Style

We use automated tools to maintain consistent code style:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix auto-fixable lint issues
npm run lint:fix
```

**Key principles:**
- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing patterns in the codebase
- Keep functions small and focused

### Testing Requirements

All contributions must include appropriate tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

**Test guidelines:**
- Unit tests for all new functions
- Integration tests for new features
- Browser compatibility tests for UI changes
- Performance tests for optimization changes

### Documentation Standards

When adding features:
- Update relevant documentation files
- Add JSDoc comments to public methods
- Include usage examples
- Update the changelog

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Examples:**
```
feat(api): add support for timed quizzes
fix(i18n): correct German translation for submit button
docs(readme): update installation instructions
test(core): add unit tests for config validation
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `chore`: Maintenance tasks

## Pull Request Process

### Before Submitting

1. **Sync with main branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run the full test suite**
   ```bash
   npm run test:full
   ```

3. **Update documentation** if needed

4. **Add changelog entry** for user-facing changes

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing done

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Changelog updated (if applicable)
```

### Review Process

1. **Automated checks** must pass (tests, linting, etc.)
2. **Code review** by maintainers
3. **Testing** in staging environment
4. **Approval** and merge

## Project Structure for Contributors

```
quiz/
├── src/                    # Source code
│   ├── core/              # Core engine files
│   ├── types/             # Question type implementations
│   ├── themes/            # CSS themes
│   ├── i18n/              # Internationalization
│   └── utils/             # Utility functions
├── __tests__/             # Test files
├── docs/                  # Documentation source
├── examples/              # Usage examples
├── scripts/               # Build and development scripts
└── dist/                  # Built files (generated)
```

## Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run build:watch      # Build in watch mode

# Testing
npm test                 # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Check code style
npm run lint:fix         # Fix auto-fixable issues
npm run format           # Format code with Prettier

# Documentation
npm run docs:dev         # Start documentation server
npm run docs:build       # Build documentation
```

## Getting Help

### Questions?
- **GitHub Discussions**: For general questions and community chat
- **Discord**: Join our [developer Discord server](https://discord.gg/infotechqo)
- **Email**: Contact maintainers at [quiz@info-tech.io](mailto:quiz@info-tech.io)

### Stuck?
- Check existing [GitHub Issues](https://github.com/info-tech-io/quiz/issues)
- Look at [closed PRs](https://github.com/info-tech-io/quiz/pulls?q=is%3Apr+is%3Aclosed) for similar work
- Ask in our [Discord community](https://discord.gg/infotechqo)

## Recognition

Contributors are recognized in several ways:
- **Contributors page** on our documentation site
- **Release notes** mention for significant contributions
- **Swag** for regular contributors (stickers, t-shirts)
- **Maintainer status** for long-term contributors

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for all. Please read our [Code of Conduct](https://github.com/info-tech-io/quiz/blob/main/CODE_OF_CONDUCT.md) before participating.

### Our Standards

- **Be respectful** and inclusive in all interactions
- **Provide constructive feedback** in code reviews
- **Help newcomers** get started
- **Be patient** with questions and learning
- **Celebrate successes** and learn from mistakes

---

Thank you for contributing to Quiz Engine! Every contribution, no matter how small, helps make the project better for everyone. 🎉