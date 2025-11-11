# GitHub Issue: Implement Unit Testing Infrastructure

## 📋 Issue Summary

Add comprehensive unit testing infrastructure to the 12-Step-Tracker project using industry best practices and modern testing tools. This will improve code quality, reduce bugs, and increase developer confidence when making changes.

## 🎯 Goals

1. **Establish Testing Foundation**: Set up Jest, React Native Testing Library, and related tools
2. **Create Testing Utilities**: Build reusable mocks, helpers, and test utilities
3. **Achieve High Coverage**: Target 80%+ code coverage for critical components
4. **Document Best Practices**: Provide clear guidelines for writing and maintaining tests
5. **Enable CI/CD**: Integrate automated testing into the development workflow

## 🔍 Research Summary

After researching the latest tools and best practices for React Native/Expo testing in 2024-2025, the recommended stack is:

### Core Tools
- **Jest 29.7+**: Industry-standard test runner with excellent React Native support
- **React Native Testing Library 12.4+**: Encourages accessible, user-centric testing
- **jest-expo 51.0+**: Expo-specific Jest preset with auto-mocking
- **@testing-library/jest-native 5.4+**: Additional matchers for React Native
- **ts-jest 29.1+**: Native TypeScript support for tests

### Why This Stack?
- ✅ **Fully Compatible** with Expo 54, React Native 0.81, and React 19
- ✅ **Industry Standard** - Used by major companies and open-source projects
- ✅ **Excellent Documentation** - Comprehensive guides and community support
- ✅ **Active Maintenance** - Regular updates and security patches
- ✅ **TypeScript First** - Built-in type safety for tests
- ✅ **Accessibility Focused** - Encourages accessible component design

## 📁 Deliverables

### Documentation
- [x] `TESTING_STRATEGY.md` - Comprehensive testing strategy and philosophy
- [x] `TESTING_IMPLEMENTATION_GUIDE.md` - Step-by-step implementation instructions
- [ ] Update `README.md` with testing section
- [ ] Update `CLAUDE.md` with testing patterns

### Configuration Files
- [ ] `jest.config.js` - Jest configuration with TypeScript support
- [ ] `test-utils/setup.ts` - Global test setup and mocks
- [ ] `test-utils/test-utils.tsx` - Custom render with providers
- [ ] `test-utils/mock-data.ts` - Reusable mock data generators

### Mock Files
- [ ] `__mocks__/@supabase/supabase-js.ts` - Supabase client mock
- [ ] `__mocks__/expo-secure-store.ts` - SecureStore mock
- [ ] `__mocks__/expo-auth-session.ts` - Auth session mock
- [ ] `__mocks__/expo-web-browser.ts` - Web browser mock

### Test Files (Phase 1 - Foundation)
- [ ] `__tests__/hooks/useFrameworkReady.test.ts`
- [ ] `__tests__/lib/supabase.test.ts`

### Test Files (Phase 2 - Core)
- [ ] `__tests__/contexts/AuthContext.test.tsx`
- [ ] `__tests__/contexts/ThemeContext.test.tsx`

### Test Files (Phase 3 - Components)
- [ ] `__tests__/components/TaskCreationModal.test.tsx`
- [ ] `__tests__/components/AnimatedBottomNav.test.tsx`

### CI/CD
- [ ] `.github/workflows/test.yml` - GitHub Actions workflow for automated testing

## 🚀 Implementation Plan

### Phase 1: Foundation (Priority: HIGH)

**Estimated Time**: 2-4 hours

#### Tasks
1. **Install Dependencies**
   ```bash
   npm install --save-dev \
     @testing-library/jest-native@^5.4.3 \
     @testing-library/react-native@^12.4.3 \
     @types/jest@^29.5.11 \
     jest@^29.7.0 \
     jest-expo@^51.0.0 \
     ts-jest@^29.1.2
   ```

2. **Create Configuration Files**
   - Create `jest.config.js` with Expo preset and TypeScript support
   - Update `package.json` with test scripts
   - Update `tsconfig.json` to include test files

3. **Create Test Utilities Directory Structure**
   ```
   test-utils/
   ├── setup.ts           # Global setup
   ├── test-utils.tsx     # Custom render
   └── mock-data.ts       # Mock data
   
   __mocks__/
   └── @supabase/
       └── supabase-js.ts
   
   __tests__/
   ├── hooks/
   ├── lib/
   ├── contexts/
   └── components/
   ```

4. **Create Mock Files**
   - Supabase client mock
   - Expo module mocks
   - React Native mocks (if needed)

5. **Verify Setup**
   ```bash
   npm test -- --version
   ```

**Acceptance Criteria**:
- ✅ All dependencies installed without errors
- ✅ Jest configuration loads successfully
- ✅ Mock files in correct locations
- ✅ Test utilities created
- ✅ `npm test` runs (even if no tests exist yet)

---

### Phase 2: First Tests (Priority: HIGH)

**Estimated Time**: 3-5 hours

#### Tasks
1. **Write Hook Tests**
   - Test `useFrameworkReady` hook
   - Verify window callback execution
   - Test edge cases

2. **Write Utility Tests**
   - Test Supabase storage adapter
   - Test platform-specific logic (web vs native)
   - Test error handling

3. **Run Tests and Verify**
   ```bash
   npm test
   npm run test:coverage
   ```

**Acceptance Criteria**:
- ✅ Hook tests pass
- ✅ Utility tests pass
- ✅ Coverage report generated
- ✅ No console errors in tests

---

### Phase 3: Context Provider Tests (Priority: HIGH)

**Estimated Time**: 4-6 hours

#### Tasks
1. **Test AuthContext**
   - Test initial state
   - Test sign in flow
   - Test sign up flow
   - Test sign out flow
   - Test Google OAuth flow
   - Test profile fetching
   - Test error handling
   - Test session persistence

2. **Test ThemeContext**
   - Test initial state
   - Test theme switching
   - Test persistence to AsyncStorage
   - Test system preference detection

3. **Improve Coverage**
   - Add edge case tests
   - Test error scenarios
   - Test async operations

**Acceptance Criteria**:
- ✅ AuthContext coverage >80%
- ✅ ThemeContext coverage >80%
- ✅ All critical paths tested
- ✅ Async operations tested properly

---

### Phase 4: Component Tests (Priority: MEDIUM)

**Estimated Time**: 4-6 hours

#### Tasks
1. **Test TaskCreationModal**
   - Test rendering
   - Test form validation
   - Test submission
   - Test cancellation
   - Test error states

2. **Test AnimatedBottomNav**
   - Test navigation rendering
   - Test tab switching
   - Test active states
   - Test animations (basic)

3. **Additional Component Tests** (as needed)
   - Identify other critical components
   - Write tests following established patterns

**Acceptance Criteria**:
- ✅ Component tests pass
- ✅ User interactions tested
- ✅ Error states handled
- ✅ Accessibility verified

---

### Phase 5: CI/CD Integration (Priority: MEDIUM)

**Estimated Time**: 1-2 hours

#### Tasks
1. **Create GitHub Actions Workflow**
   - Set up Node.js environment
   - Install dependencies
   - Run tests with coverage
   - Upload coverage reports

2. **Configure Status Checks**
   - Require tests to pass before merge
   - Display coverage in PRs

3. **Test Workflow**
   - Create test PR
   - Verify workflow runs
   - Check coverage reports

**Acceptance Criteria**:
- ✅ Workflow runs on push and PR
- ✅ Tests pass in CI environment
- ✅ Coverage reports generated
- ✅ Status checks enforced

---

### Phase 6: Documentation & Polish (Priority: LOW)

**Estimated Time**: 2-3 hours

#### Tasks
1. **Update Documentation**
   - Add testing section to README.md
   - Update CLAUDE.md with testing patterns
   - Document common issues and solutions

2. **Create Testing Guidelines**
   - Document naming conventions
   - Document test structure
   - Provide examples for common scenarios

3. **Team Training** (optional)
   - Create tutorial for new developers
   - Share best practices
   - Review testing patterns

**Acceptance Criteria**:
- ✅ README.md updated
- ✅ CLAUDE.md updated
- ✅ Examples documented
- ✅ Guidelines clear and accessible

---

## 📊 Success Metrics

### Quantitative Goals
- [ ] 80%+ overall code coverage
- [ ] 100% coverage for critical auth flows
- [ ] <60 seconds for full test suite execution
- [ ] 99%+ test pass rate on CI

### Qualitative Goals
- [ ] Developers confident in refactoring
- [ ] Reduced debugging time
- [ ] Faster onboarding for new developers
- [ ] Better code design through testability

## 🛠 Technical Specifications

### Dependencies

```json
{
  "devDependencies": {
    "@testing-library/jest-native": "^5.4.3",
    "@testing-library/react-native": "^12.4.3",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "jest-expo": "^51.0.0",
    "ts-jest": "^29.1.2"
  }
}
```

### Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### Coverage Thresholds

```javascript
{
  branches: 70,
  functions: 70,
  lines: 80,
  statements: 80
}
```

## ⚠️ Potential Risks & Mitigation

### Risk 1: Version Compatibility
**Impact**: High  
**Probability**: Low  
**Mitigation**: Use exact versions tested with Expo 54 and React 19

### Risk 2: Async Test Complexity
**Impact**: Medium  
**Probability**: Medium  
**Mitigation**: Use waitFor and proper async utilities from Testing Library

### Risk 3: Mock Maintenance
**Impact**: Medium  
**Probability**: Medium  
**Mitigation**: Keep mocks simple and update them when APIs change

### Risk 4: Slow Test Suite
**Impact**: Low  
**Probability**: Medium  
**Mitigation**: Run tests in parallel, optimize slow tests, use focused tests during development

## 📚 Resources

### Documentation
- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)

### Internal Documentation
- `TESTING_STRATEGY.md` - Complete testing strategy
- `TESTING_IMPLEMENTATION_GUIDE.md` - Step-by-step guide

## ✅ Definition of Done

- [ ] All test infrastructure installed and configured
- [ ] Minimum 80% code coverage achieved
- [ ] All critical components tested
- [ ] CI/CD pipeline integrated
- [ ] Documentation updated
- [ ] All tests passing
- [ ] No test-related console errors
- [ ] Code reviewed and approved
- [ ] Merged to main branch

## 🏷 Labels

- `enhancement`
- `testing`
- `infrastructure`
- `good-first-issue` (for individual test files)
- `documentation`

## 👥 Assignees

TBD

## ⏱ Timeline

**Total Estimated Time**: 16-26 hours  
**Target Completion**: 2-3 weeks (with 1-2 hours per day)

### Suggested Schedule
- **Week 1**: Phases 1-2 (Foundation + First Tests)
- **Week 2**: Phases 3-4 (Context + Component Tests)
- **Week 3**: Phases 5-6 (CI/CD + Documentation)

## 🔗 Related Issues

- None (this is the foundational testing issue)

## 💬 Comments & Questions

**Q: Why not use Detox or Maestro for E2E testing?**  
A: E2E testing is valuable but adds significant complexity. We're starting with unit and integration tests to establish a solid foundation. E2E tests can be added in a future phase.

**Q: Why these specific versions?**  
A: These versions are verified to work with Expo 54, React Native 0.81, and React 19. They represent the latest stable releases as of 2024-2025.

**Q: What about snapshot testing?**  
A: Snapshot testing can be useful for UI components but should be used sparingly. Focus on behavior testing first, then add snapshots for complex UI components if needed.

**Q: How do we maintain test quality?**  
A: Through code reviews, coverage thresholds, and regular test maintenance. Tests should be treated as first-class code.

---

**Created**: 2025-11-11  
**Last Updated**: 2025-11-11  
**Status**: Open  
**Priority**: High
