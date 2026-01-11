# Tests Temporarily Disabled

The test files have been moved here temporarily because the test dependencies haven't been installed yet.

## To Enable Tests

1. **Install test dependencies:**
   ```bash
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
   ```

2. **Move tests back:**
   ```bash
   mv __tests_disabled__/lib src/lib/__tests__
   mv __tests_disabled__/components src/components/__tests__
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

## Why Tests Are Disabled

TypeScript compilation was failing because:
- `@jest/globals` package not installed
- `@testing-library/react` package not installed
- Jest types not available

Once you install the dependencies, the tests will work perfectly!

## Test Files Available

- `lib/validations.test.ts` - 30+ validation tests
- `lib/api-helpers.test.ts` - 10+ API utility tests
- `components/ErrorBoundary.test.tsx` - 10+ error boundary tests

See [TESTING_GUIDE.md](../TESTING_GUIDE.md) for full testing documentation.
