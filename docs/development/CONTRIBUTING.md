# Contributing to NeuraMint

Thank you for your interest in contributing to NeuraMint! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Branching Strategy](#branching-strategy)
- [Commit Guidelines](#commit-guidelines)
- [Pull Requests](#pull-requests)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Community](#community)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all contributors to adhere to this code to ensure a positive and respectful environment for everyone.

## Getting Started

1. **Fork the Repository**
   - Visit the [NeuraMint GitHub repository](https://github.com/NeuraMint/NRAM)
   - Click the "Fork" button in the top-right corner

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/NRAM.git
   cd NRAM
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/NeuraMint/NRAM.git
   ```

4. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

## Development Environment

### Prerequisites

- Node.js (v16+)
- npm or Yarn
- Solana CLI tools
- Anchor Framework
- A Solana wallet (Phantom, Solflare, etc.)

### Setup Local Environment

1. Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

2. Configure your local Solana validator:
   ```bash
   solana-test-validator
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Access the application at [http://localhost:3000](http://localhost:3000)

## Branching Strategy

We follow the GitHub Flow branching strategy:

1. **Main Branch**: The `main` branch contains production-ready code. All development happens in feature branches.

2. **Feature Branches**: Create a new branch for each feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

3. **Branch Naming Convention**:
   - `feature/descriptive-feature-name` for new features
   - `fix/issue-description` for bug fixes
   - `docs/what-was-documented` for documentation changes
   - `refactor/component-name` for code refactoring
   - `test/feature-being-tested` for test additions or modifications

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to the build process, auxiliary tools, libraries, etc.

### Examples

```
feat(marketplace): add search filters for neural attributes

fix(validation): resolve issue with reward calculation

docs(api): update authentication documentation
```

### Commit Messages Best Practices

- Use the imperative mood ("Add feature" not "Added feature")
- Don't capitalize the first letter
- No period at the end
- Keep it concise but descriptive
- Reference issues in the commit body or footer when relevant

## Pull Requests

1. **Update Your Branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Push to Your Fork**
   ```bash
   git push origin your-feature-branch
   ```

3. **Create a Pull Request**
   - Go to the [NeuraMint repository](https://github.com/NeuraMint/NRAM)
   - Click "New Pull Request"
   - Select "compare across forks"
   - Select your fork and branch
   - Fill out the PR template

4. **PR Guidelines**
   - Provide a clear, descriptive title
   - Reference any related issues
   - Include a detailed description of changes
   - Add screenshots for UI changes
   - Ensure all tests pass
   - Request review from relevant team members

5. **Address Review Feedback**
   - Make requested changes
   - Push updates to your branch
   - Respond to reviewer comments

## Code Style

We use ESLint and Prettier to enforce code style. Our configuration files are included in the repository.

### JavaScript/TypeScript

- Use TypeScript for all new code
- Follow the configured ESLint rules
- Document public APIs with JSDoc comments

### React Components

- Prefer functional components and hooks
- Use TypeScript interfaces for component props
- Keep components focused on a single responsibility
- Follow the established project patterns for state management

### Solana Programs

- Follow the Anchor Framework patterns
- Document all program instructions and accounts
- Include comprehensive error handling
- Write detailed comments for complex logic

### Running Linters

```bash
# Run ESLint
npm run lint

# Run Prettier
npm run format

# Fix automatic issues
npm run lint:fix
```

## Testing

We require tests for all new features and bug fixes.

### Frontend Tests

We use Jest and React Testing Library for frontend tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.ts
```

### Smart Contract Tests

We use Anchor's testing framework for Solana programs:

```bash
# Run Anchor tests
anchor test
```

### Test Guidelines

- Write unit tests for utility functions and hooks
- Write integration tests for complex components
- Write end-to-end tests for critical user flows
- Aim for at least 80% test coverage for new code
- Mock external dependencies and blockchain calls

## Documentation

Documentation is crucial for the project. Please update documentation when:

- Adding new features
- Changing existing functionality
- Fixing bugs that affect user behavior
- Adding or modifying API endpoints

### Documentation Types

- **Code Comments**: Explain complex logic or non-obvious decisions
- **JSDoc**: Document interfaces, functions, and components
- **README Files**: Update relevant README files for changed components
- **API Documentation**: Update API.md for API changes
- **User Documentation**: Update user guides for UI/UX changes

## Issue Reporting

Please report issues using the GitHub issue tracker:

1. Search existing issues before creating a new one
2. Use the provided issue templates
3. Include detailed steps to reproduce
4. Include relevant information:
   - Environment details
   - Browser version
   - Error messages
   - Screenshots or recordings when applicable

## Feature Requests

We welcome feature requests! When submitting a feature request:

1. Use the feature request template
2. Clearly describe the problem the feature would solve
3. Suggest a possible implementation if you have ideas
4. Explain why this feature would benefit the wider community

## Community

Join our community channels to connect with other contributors:

- [Twitter](https://x.com/NeuraMint_)
- [Website](https://www.neuramint.tech)
- [GitHub Discussions](https://github.com/NeuraMint/NRAM/discussions)

## Recognition

All contributors will be acknowledged in our [CONTRIBUTORS.md](CONTRIBUTORS.md) file. We appreciate and value your contributions!

---

This guide is a living document and may be updated as our project evolves. Thank you for contributing to NeuraMint! 