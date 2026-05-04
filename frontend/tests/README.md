# Frontend Testing Guide

We use **Playwright** for End-to-End (E2E) testing. These tests run in a real browser environment to ensure our main user journeys are functional.

## Existing Tests

1.  **Auth Flow (`auth.spec.ts`)**: 
    - Verifies successful login with mocked Supabase responses.
    - Verifies error handling for invalid credentials.
2.  **Dashboard Display (`dashboard.spec.ts`)**:
    - Ensures the dashboard loads correctly and handles different empty/populated states.
3.  **Car Management**:
    - Tests adding and removing vehicles (UI validation).
4.  **Storage/Services**:
    - Tests the service record visibility and management.

## Running Tests

From the `frontend` directory:

### CLI Mode (Fastest)
Run all tests in the background:
```bash
npx playwright test
```

### UI Mode (Recommended for Debugging)
Open the Playwright UI to see tests run step-by-step with time-travel debugging:
```bash
npx playwright test --ui
```

### Headed Mode
Run tests in a visible browser:
```bash
npx playwright test --headed
```

## Creating New Tests
Place new test files in this directory with the `.spec.ts` extension. Use `page.route()` to mock API calls where possible to keep tests fast and deterministic.
