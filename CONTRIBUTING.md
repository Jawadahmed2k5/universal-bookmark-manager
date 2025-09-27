# Contributing to Universal Bookmark Manager

Thank you for your interest in contributing to Universal Bookmark Manager! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- A modern browser (Chrome, Firefox, Edge)

### Setup Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/universal-bookmark-manager.git
   cd universal-bookmark-manager
   ```

2. **Run setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
universal-bookmark-manager/
├── packages/
│   ├── shared/           # Shared utilities and types
│   ├── extension/        # Browser extension
│   ├── dashboard/        # React dashboard
│   └── native-messaging/ # Native host application
├── docs/                 # Documentation
└── scripts/              # Build and deployment scripts
```

## 🛠️ Development Guidelines

### Code Style
- Use **TypeScript** for all new code
- Follow **ESLint** rules (configured in `.eslintrc.json`)
- Use **Prettier** for code formatting
- Write **meaningful commit messages** (Conventional Commits)

### Naming Conventions
- **Files**: kebab-case (`bookmark-manager.ts`)
- **Functions**: camelCase (`addBookmark`)
- **Classes**: PascalCase (`BookmarkManager`)
- **Constants**: UPPER_SNAKE_CASE (`STORAGE_KEYS`)
- **Interfaces**: PascalCase with descriptive names (`BookmarkStorage`)

### Testing
- Write unit tests for new features
- Maintain test coverage above 80%
- Use Jest for testing framework
- Test both happy paths and error cases

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Building
```bash
# Build all packages
npm run build

# Build specific package
cd packages/extension && npm run build

# Build for specific browser
npm run build:chrome
npm run build:firefox
```

## 📝 Contribution Process

### 1. Issue First
- Check existing issues before creating new ones
- Use issue templates when available
- Provide clear reproduction steps for bugs
- Discuss feature requests before implementation

### 2. Branch Strategy
- Create feature branches from `main`
- Use descriptive branch names: `feature/fuzzy-search`, `fix/sync-bug`
- Keep branches focused on single features/fixes

### 3. Pull Request Process
1. **Create PR** against `main` branch
2. **Fill out** PR template completely
3. **Ensure** all checks pass (tests, linting, build)
4. **Request review** from maintainers
5. **Address feedback** promptly
6. **Squash commits** before merge (if requested)

### 4. Commit Messages
Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```
feat(search): add fuzzy search with configurable threshold
fix(sync): resolve conflict resolution edge case
docs(readme): update installation instructions
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style/formatting
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

## 🧪 Testing Guidelines

### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Use descriptive test names

```typescript
describe('BookmarkManager', () => {
  it('should add bookmark with generated ID', async () => {
    // Test implementation
  });
});
```

### Integration Tests
- Test component interactions
- Test API integrations
- Test storage operations

### E2E Tests
- Test complete user workflows
- Test extension functionality in browser
- Use browser automation tools

## 📦 Package-Specific Guidelines

### Shared Package (`packages/shared`)
- Contains reusable utilities and types
- Must be framework-agnostic
- Comprehensive unit tests required
- No external UI dependencies

### Extension Package (`packages/extension`)
- Follow WebExtensions API best practices
- Support Manifest V3 requirements
- Test across multiple browsers
- Minimize permissions requested

### Dashboard Package (`packages/dashboard`)
- Use React best practices
- Implement responsive design
- Follow accessibility guidelines
- Optimize for performance

### Native Messaging (`packages/native-messaging`)
- Support cross-platform operation
- Handle errors gracefully
- Secure data handling
- Minimal dependencies

## 🎨 UI/UX Guidelines

### Design Principles
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Fast loading and smooth interactions
- **Responsive**: Works on all screen sizes
- **Consistency**: Follow established patterns

### Component Guidelines
- Use TypeScript props interfaces
- Implement proper error boundaries
- Support dark/light themes
- Include loading states

## 🔒 Security Guidelines

### Data Handling
- Encrypt sensitive data (AES-256)
- Validate all inputs
- Sanitize user content
- Use secure communication protocols

### Extension Security
- Request minimal permissions
- Validate message origins
- Sanitize DOM manipulations
- Protect against XSS

### Native Messaging
- Validate all messages
- Use secure file operations
- Handle process isolation
- Protect against injection attacks

## 📋 Review Checklist

Before submitting PR, ensure:

- [ ] Code follows style guidelines
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No console errors
- [ ] Performance impact considered
- [ ] Accessibility requirements met
- [ ] Security implications reviewed
- [ ] Cross-browser compatibility tested

## 🏷️ Release Process

### Versioning
We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps
1. Update version numbers in `package.json` files
2. Update `CHANGELOG.md`
3. Create release branch
4. Test thoroughly across browsers
5. Create GitHub release with changelog
6. Deploy to browser stores

## 🆘 Getting Help

### Documentation
- [README.md](README.md) - Project overview
- [API Documentation](docs/api.md) - API reference
- [Architecture Guide](docs/architecture.md) - Technical details

### Community
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Email**: development@ubm.dev

### Maintainers
- **@maintainer1** - Project lead
- **@maintainer2** - Extension specialist
- **@maintainer3** - UI/UX expert

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🎉 Recognition

Contributors will be:
- Added to `CONTRIBUTORS.md`
- Mentioned in release notes
- Invited to maintainer team (for significant contributions)

Thank you for contributing to Universal Bookmark Manager! 🚀