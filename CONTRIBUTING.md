# Contributing to PD Portal

Thank you for your interest in contributing to PD Portal! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/pd-portal.git
   cd pd-portal
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/original-owner/pd-portal.git
   ```
4. **Set up your development environment** following the instructions in [README.md](README.md)

## Development Workflow

### 1. Create a Branch

Create a new branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - for new features
- `fix/` - for bug fixes
- `docs/` - for documentation updates
- `refactor/` - for code refactoring
- `test/` - for adding or updating tests

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation as needed
- Write or update tests for your changes

### 3. Test Your Changes

Before submitting:

```bash
# Backend tests
cd backend
npm test
npm run lint

# Frontend tests
cd frontend
npm test
npm run lint
```

Ensure all tests pass and there are no linting errors.

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "Add feature: brief description of what you did"
```

Good commit message examples:
- `Add email notification preferences page`
- `Fix registration bug when session is full`
- `Update README with Docker instructions`
- `Refactor session controller for better error handling`

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then:
1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template with details about your changes

## Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript strict mode
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Follow existing naming conventions:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and components
  - `UPPER_SNAKE_CASE` for constants
- Add type annotations where TypeScript can't infer
- Keep functions small and focused (single responsibility)

### React Components

- Use functional components with hooks
- Keep components small and reusable
- Use TypeScript interfaces for props
- Follow React best practices:
  - Use `useCallback` and `useMemo` appropriately
  - Avoid unnecessary re-renders
  - Keep state as local as possible

### Database

- Use parameterized queries (never string concatenation)
- Follow PostgreSQL naming conventions:
  - `snake_case` for table and column names
  - Plural names for tables (e.g., `users`, `sessions`)
- Include migrations for schema changes
- Add indexes for frequently queried columns

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] No linting errors
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up to date with main branch

### PR Description Should Include

1. **What**: Brief description of changes
2. **Why**: Reason for the changes (link to issue if applicable)
3. **How**: Technical approach taken
4. **Testing**: How you tested the changes
5. **Screenshots**: For UI changes (before/after if applicable)

### Example PR Template

```markdown
## Description
Brief description of what this PR does

## Related Issue
Closes #123

## Changes Made
- Added feature X
- Fixed bug Y
- Updated documentation

## Testing
- [ ] Manual testing completed
- [ ] Unit tests added/updated
- [ ] Integration tests pass

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
```

## Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: 
   - OS (Windows/Mac/Linux)
   - Node.js version
   - PostgreSQL version
   - Browser (for frontend issues)
6. **Screenshots/Logs**: If applicable
7. **Possible Fix**: If you have suggestions

## Requesting Features

For feature requests, please include:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How would the feature work?
3. **Alternatives Considered**: Other approaches you've thought about
4. **Additional Context**: Any other relevant information

## Development Setup Tips

### Database Reset

To reset your database during development:

```bash
psql -U postgres -d pd_portal -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -U postgres -d pd_portal -f backend/database/schema.sql
psql -U postgres -d pd_portal -f backend/database/seeds.sql
```

### Quick Test Data

Load test data for development:

```bash
psql -U postgres -d pd_portal -f backend/database/test-data.sql
```

### Backend Hot Reload

The backend uses `nodemon` for hot reload. Changes to `.ts` files will automatically restart the server.

### Frontend Hot Reload

Vite provides fast hot module replacement (HMR). Save changes and see them instantly.

## Project Structure

Understanding the codebase:

```
backend/
├── src/
│   ├── config/         # Configuration (database, env)
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth, validation, error handling
│   ├── models/         # Data models (types)
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   └── server.ts       # Express app entry point

frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   │   ├── admin/     # Admin pages
│   │   ├── staff/     # Staff pages
│   │   └── auth/      # Auth pages
│   ├── services/       # API clients
│   ├── context/        # React context
│   └── App.tsx         # Main app component
```

## Common Tasks

### Adding a New API Endpoint

1. Create route in `backend/src/routes/`
2. Create controller in `backend/src/controllers/`
3. Add service logic in `backend/src/services/` if needed
4. Add tests
5. Update API documentation in README

### Adding a New Page

1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Update navigation if needed
4. Add tests

### Adding a Database Table

1. Add schema in `backend/database/schema.sql`
2. Create migration script
3. Update seed data if needed
4. Add model types
5. Update controllers/services

## Questions?

- Check existing [issues](https://github.com/owner/pd-portal/issues)
- Review [documentation](README.md)
- Ask in pull request comments

## Recognition

All contributors will be recognized in our README and release notes. Thank you for helping make PD Portal better!

---

**Happy coding! 🚀**
