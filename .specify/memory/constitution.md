<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0
Added sections:
  - Core Principles (I–V): Code Quality, Test-First, UI/UX Consistency, Security, Performance
  - Security Requirements
  - Quality Gates & Development Workflow
  - Governance
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ — Constitution Check section references these principles
  - .specify/templates/spec-template.md ✅ — no structural changes needed
  - .specify/templates/tasks-template.md ✅ — task categorization aligned with principles
Deferred TODOs: none
-->

# Team Kanban Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

Every piece of code merged into the main branch MUST meet the following standards:

- Code MUST follow the language/framework style guide enforced by the project linter (ESLint/Prettier for TypeScript/JavaScript; equivalent for other languages). No lint errors are allowed.
- Functions and components MUST have a single, clear responsibility (Single Responsibility Principle). Functions exceeding 40 lines MUST be refactored.
- Duplication is forbidden. Logic appearing more than once MUST be extracted into a shared utility or service.
- All public APIs (functions, components, REST endpoints) MUST have explicit type annotations.
- Magic numbers and strings MUST be replaced with named constants.
- Dead code (unreachable blocks, unused imports, commented-out logic) MUST NOT be committed.

**Rationale**: Consistent, clean code reduces cognitive load, accelerates onboarding, and makes the codebase maintainable as the team and feature set grow.

### II. Test-First (NON-NEGOTIABLE)

Test-Driven Development (TDD) is mandatory for all feature work:

- Tests MUST be written before implementation. The sequence is: write failing test → get approval → implement until green → refactor.
- Unit test coverage MUST reach ≥ 80% on all new code paths.
- Integration tests MUST cover every user story's acceptance scenarios defined in the spec.
- Tests MUST be deterministic (no flaky tests). A test that fails intermittently MUST be fixed or removed immediately.
- Test files MUST reside alongside source code (`*.spec.ts` / `*.test.ts`) or under `tests/` following the project structure in `plan.md`.
- No PR is mergeable if any test is red.

**Rationale**: Automated tests are the primary safety net for refactoring and regression prevention. TDD drives better API design by forcing the developer to use the code before writing it.

### III. UI/UX Consistency

All user-facing surfaces MUST conform to a shared design system:

- Every UI component MUST be built using the project's approved component library (e.g., shadcn/ui, Radix UI, or equivalent defined in `plan.md`). Custom one-off styling is forbidden unless the design system lacks the required primitive.
- Spacing, color, typography, and breakpoints MUST use design tokens (CSS variables or Tailwind config values). Hard-coded pixel values or hex colors in components are forbidden.
- Interactive elements MUST meet WCAG 2.1 AA accessibility standards: keyboard navigability, sufficient color contrast (≥ 4.5:1 for normal text), and ARIA labels for icon-only controls.
- Loading, empty, and error states MUST be designed and implemented for every data-driven component — no component may render in an undefined visual state.
- Responsive behavior MUST be verified at mobile (375 px), tablet (768 px), and desktop (1280 px) breakpoints.

**Rationale**: A consistent UI reduces user confusion, speeds up development through reuse, and ensures the product is accessible to all users.

### IV. Security

Security is a first-class requirement, not a post-launch concern:

- All user input (form fields, URL params, query strings) MUST be validated and sanitized server-side before persistence or business logic processing.
- Authentication tokens MUST be stored in `httpOnly` cookies; never in `localStorage` or `sessionStorage`.
- All API routes that access user data MUST enforce authorization checks — no endpoint may assume the caller is authorized based solely on authentication.
- Sensitive data (passwords, tokens, secrets) MUST NEVER be logged, committed to source control, or exposed in client-side bundles. Secrets MUST be managed through environment variables or a secrets manager.
- Dependencies MUST be audited on every CI run (`npm audit` or equivalent). High/critical vulnerabilities MUST be resolved before merging.
- OWASP Top 10 risks (injection, broken auth, XSS, IDOR, etc.) MUST be reviewed during code review for every feature that touches auth, data input, or external APIs.

**Rationale**: A Kanban board holds team workflows and potentially sensitive project data. Security failures erode trust and may cause irreversible data exposure.

### V. Performance

The application MUST remain fast and responsive under normal load:

- Initial page load (LCP) MUST be ≤ 2.5 s on a simulated 4G connection (Lighthouse score ≥ 85).
- API responses for read operations MUST have a p95 latency ≤ 300 ms under the expected load defined in `plan.md`.
- Client-side bundle size MUST NOT exceed 250 KB gzipped for the critical path. Code splitting MUST be applied for non-critical routes.
- Database queries MUST be reviewed for N+1 problems before merging. Queries fetching list data MUST be paginated.
- Performance regressions ≥ 20% compared to the baseline MUST block merge until resolved.

**Rationale**: Performance directly affects user satisfaction and adoption. Preventive constraints are far cheaper than retrofitting performance after launch.

## Security Requirements

The following controls are non-optional and MUST be verified during code review and automated CI checks:

- **HTTPS only**: All traffic MUST be served over HTTPS in staging and production environments.
- **CORS policy**: API servers MUST enforce an explicit allowlist of origins; wildcard (`*`) is forbidden in production.
- **Rate limiting**: Authentication endpoints MUST be rate-limited (e.g., ≤ 10 attempts per minute per IP).
- **Content Security Policy**: A CSP header MUST be configured to restrict script sources and prevent XSS injection.
- **Dependency scanning**: CI pipeline MUST include `npm audit --audit-level=high` (or equivalent). Builds fail on high or critical findings.
- **Secret scanning**: Pre-commit hooks MUST scan for accidental secret commits (e.g., using `gitleaks` or equivalent).

## Quality Gates & Development Workflow

All features MUST pass the following gates before a PR is merged:

1. **Lint gate**: Zero lint errors and zero type errors (`tsc --noEmit` or equivalent).
2. **Test gate**: All existing and new tests pass; coverage on new code ≥ 80%.
3. **Security gate**: No new high/critical dependency vulnerabilities; secrets scan clean.
4. **Performance gate**: Lighthouse CI score does not regress below defined thresholds.
5. **Review gate**: At least one peer code review approval required; reviewer MUST verify constitution compliance.
6. **Accessibility gate**: New UI components pass automated a11y checks (e.g., `axe-core` integration in tests).

**Branch strategy**: Feature branches off `main`; no direct commits to `main`. PRs MUST reference the spec or task ID.

## Governance

This constitution supersedes all other development practices documented in this repository.
Any practice that conflicts with a principle stated here is invalid until the constitution is amended.

**Amendment procedure**:
1. Open a proposal PR editing `.specify/memory/constitution.md`.
2. State the rationale and impact in the PR description.
3. Version bump follows semantic versioning rules (see below).
4. Requires approval from ≥ 2 team members.
5. Propagate changes to affected templates and document in the Sync Impact Report comment at the top of this file.

**Versioning policy**:
- **MAJOR**: Removal or redefinition of an existing principle.
- **MINOR**: Addition of a new principle or section.
- **PATCH**: Clarification, wording improvement, or typo fix.

**Compliance review**: Every PR reviewer MUST confirm constitution compliance as part of the review checklist. Violations found post-merge MUST be resolved in the next sprint.

**Version**: 1.0.0 | **Ratified**: 2026-06-29 | **Last Amended**: 2026-06-29
