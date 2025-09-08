# Contributing

We welcome contributions to Graph Explorer! This guide will help you get started
with contributing to the project.

## Getting Started

### Prerequisites

Before contributing, make sure you have:

- **pnpm** >=10.12.1
- **Node.js** >=24.4.0
- **Git** for version control
- **Docker** (optional, for testing deployments)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/graph-explorer.git
   cd graph-explorer
   ```
3. **Enable Corepack** to ensure consistent package manager usage:
   ```bash
   corepack enable
   ```
4. **Install dependencies**:
   ```bash
   pnpm install
   ```
5. **Start the development servers**:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branch Strategy

- **main**: Production-ready code
- **feature/**: New features (`feature/add-new-visualization`)
- **fix/**: Bug fixes (`fix/connection-timeout-issue`)
- **docs/**: Documentation updates (`docs/update-installation-guide`)

### Making Changes

1. **Create a new branch** from main:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:

   ```bash
   # Run tests
   pnpm test

   # Check types
   pnpm check:types

   # Lint code
   pnpm check:lint

   # Check formatting
   pnpm check:format

   # Run all checks
   pnpm checks
   ```

4. **Commit your changes** with a descriptive message:

   ```bash
   git add .
   git commit -m "feat: add new graph layout algorithm"
   ```

5. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Prefer interfaces over types for object shapes
- Use strict type checking
- Document complex types with JSDoc comments

### React Guidelines

- Use functional components with hooks
- Leverage React Compiler optimizations (avoid manual `useMemo` and
  `useCallback`)
- Follow the component structure in `packages/graph-explorer/src/components/`
- Use the `cn()` utility for conditional class application

### Styling Guidelines

- **Primary**: Use Tailwind CSS utility classes
- **Avoid**: Emotion CSS-in-JS (being phased out)
- **Components**: Use Radix UI primitives for new components instead of Mantine
- **Consistency**: Follow existing patterns in the codebase

### Code Organization

- Keep components small and focused on a single responsibility
- Use descriptive names for files, functions, and variables
- Group related functionality in modules
- Export public APIs through index files

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Generate coverage report
pnpm coverage
```

### Writing Tests

- Write tests for new features and bug fixes
- Use Vitest for unit and integration tests
- Mock external dependencies appropriately
- Focus on testing behavior, not implementation details

### Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Documentation

### Documentation Standards

- Update documentation for any user-facing changes
- Use clear, concise language
- Include code examples where helpful
- Follow the documentation structure guidelines

### Types of Documentation

1. **Code Comments**: For complex logic and public APIs
2. **README Updates**: For setup and basic usage changes
3. **Feature Documentation**: For new features in `additionaldocs/`
4. **API Documentation**: For public interfaces and components

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**: `pnpm checks`
2. **Update documentation** as needed
3. **Add tests** for new functionality
4. **Follow commit message conventions**
5. **Rebase on latest main** if needed

### Pull Request Template

When creating a pull request, include:

- **Description**: What does this PR do?
- **Motivation**: Why is this change needed?
- **Testing**: How was this tested?
- **Screenshots**: For UI changes
- **Breaking Changes**: Any breaking changes?
- **Checklist**: Completed items from the PR template

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and checks
2. **Code Review**: Maintainers review code quality and design
3. **Testing**: Reviewers may test functionality manually
4. **Approval**: At least one maintainer approval required
5. **Merge**: Maintainers merge approved PRs

## Release Process

### Version Management

The project uses a monorepo structure with three `package.json` files:

- `<root>/package.json`: Repository management utilities
- `<root>/packages/graph-explorer/package.json`: UI client package
- `<root>/packages/graph-explorer-proxy-server/package.json`: Node server
  package

### Version Coordination

When preparing a release:

1. **Update all three** `package.json` files with the same version number
2. **UI version**: The version displayed in the UI comes from
   `packages/graph-explorer/package.json`
3. **Changelog**: Update `Changelog.md` with release notes
4. **Testing**: Thoroughly test the release candidate

## Community Guidelines

### Code of Conduct

Please read and follow our [Code of Conduct](../../CODE_OF_CONDUCT.md).

### Communication

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Requests**: For code contributions and reviews

### Getting Help

- **Documentation**: Check existing documentation first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for help in PR comments

## Contribution Types

### Bug Fixes

- **Report**: Create detailed bug reports with reproduction steps
- **Fix**: Submit PRs with fixes and tests
- **Verify**: Help verify fixes work as expected

### New Features

- **Propose**: Create feature requests with use cases
- **Discuss**: Participate in feature discussions
- **Implement**: Submit PRs with new functionality
- **Document**: Update documentation for new features

### Documentation

- **Improve**: Fix typos, clarify instructions
- **Expand**: Add missing documentation
- **Translate**: Help with internationalization
- **Examples**: Add code examples and tutorials

### Testing

- **Write Tests**: Add test coverage for existing code
- **Manual Testing**: Test new features and bug fixes
- **Performance**: Help identify and fix performance issues
- **Compatibility**: Test across different environments

## Recognition

Contributors are recognized in several ways:

- **Changelog**: Significant contributions mentioned in release notes
- **Contributors**: Listed in repository contributors
- **Issues**: Credit given in issue resolutions
- **Community**: Recognition in community discussions

Thank you for contributing to Graph Explorer! Your contributions help make graph
data exploration accessible to everyone.
