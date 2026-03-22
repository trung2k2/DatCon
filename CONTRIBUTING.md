# Contributing to DatCon

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and inclusive in all interactions.

## Getting Started

### Prerequisites

- Node.js 16+
- TypeScript knowledge
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/DatCon.git
   cd DatCon
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies**
   ```bash
   cd electron-app
   npm install
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## Making Changes

### Code Style

- Use TypeScript for all new code
- Follow the existing code style (2-space indentation)
- Run `npm run format` before committing
- Run `npm run lint` to check for errors

### Commit Messages

Follow conventional commits format:

```
type(scope): subject

body

footer
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example**:
```
feat(parser): add support for V4 DAT format

- Add V4 record structure parsing
- Implement new XOR key derivation
- Update tests

Closes #123
```

### Testing

- Write tests for new features
- Ensure all tests pass: `npm test`
- Test UI changes in both dev and production builds

## File Structure

```
electron-app/
├── src/
│   ├── main.ts              # Electron main process (DO NOT EDIT LIGHTLY)
│   ├── backend/
│   │   └── datParser.ts     # DAT parsing logic (CORE LOGIC)
│   ├── renderer/
│   │   ├── App.tsx          # Root React component
│   │   └── ui/              # Reusable UI components
│   └── ipc/                 # IPC handlers (bridge to backend)
└── ...
```

### Key Files to Know

- **datParser.ts**: Core parsing logic - changes here affect output
- **App.tsx**: Main UI flow - user-facing changes
- **handlers.ts**: Communication between UI and backend
- **main.ts**: Electron lifecycle - rarely needs changes

## Pull Request Process

1. **Create descriptive title**
   - Use format: `[Electron] Fix KML export` or `[Backend] Add V4 support`

2. **Fill PR template completely**
   - Describe what you changed and why
   - Reference related issues

3. **Ensure CI passes**
   - All GitHub Actions workflows must pass
   - No ESLint errors
   - TypeScript compilation successful

4. **Request review**
   - At least 1 maintainer review required
   - Respond to feedback promptly

5. **Squash commits before merge** (if requested)
   ```bash
   git rebase -i main
   git push --force-with-lease
   ```

## Areas for Contribution

### High Priority

- [ ] Expand DAT record type support (more aircraft models)
- [ ] V4 format support investigation
- [ ] Performance optimization for large files
- [ ] Cross-platform UI testing

### Documentation

- [ ] DAT format specification document
- [ ] API documentation
- [ ] Tutorial videos
- [ ] Troubleshooting guide

### Testing

- [ ] Automated UI tests
- [ ] Cross-platform build testing
- [ ] Sample DAT file repository

## Bug Reports

Found a bug? Great! Please file an issue with:

1. **Clear title**: What's the problem?
2. **Steps to reproduce**: Exact steps
3. **Expected vs actual**: What should happen vs what happens
4. **Environment**: OS, Node version, app version
5. **Screenshots/logs**: Evidence (if applicable)

## Feature Requests

Want a feature? Submit an issue with:

1. **Use case**: Why would you need this?
2. **Proposed solution**: How should it work?
3. **Alternatives considered**: What else could work?
4. **Examples**: Show how users would interact with it

## Review Guidelines

When reviewing PRs:

- ✅ Code follows style guide
- ✅ Tests added for new features
- ✅ No performance regression
- ✅ Documentation updated
- ✅ Commits are clean and well-messaged

## Merge Requirements

- [ ] All CI checks pass
- [ ] At least 1 approval from maintainer
- [ ] No unresolved conversations
- [ ] Commits squashed (if needed)
- [ ] Branch up-to-date with main

## Questions?

- Check [README.md](../README.md)
- Search closed [issues](https://github.com/your-repo/issues)
- Open a discussion in [Discussions](https://github.com/your-repo/discussions)

Thank you for contributing! 🎉
