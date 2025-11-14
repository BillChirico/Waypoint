# Sobriety Waypoint Rebrand Design

**Date**: 2025-11-14
**Status**: Approved
**Type**: Complete Project Rebrand

---

## Executive Summary

Complete rebrand of "12-Step Tracker" to "Sobriety Waypoint" with fresh infrastructure, generic recovery language, and new technical identifiers. This is a clean-slate approach requiring new app store submissions and Expo project.

**Key Changes:**

- Display name: "12-Step Tracker" → "Sobriety Waypoint"
- Package: `12-step-tracker` → `sobriety-waypoint`
- Bundle IDs: `com.volvoxllc.twelvesteptracker` → `com.volvoxllc.sobrietywaypoint`
- Content: "12-step program" → "recovery program" terminology
- Infrastructure: New Expo project, new Sentry project, renamed GitHub repo

---

## 1. Scope & Strategy

### Complete Rebrand Scope

**Name Changes:**

- Display name: "12-Step Tracker" → "Sobriety Waypoint"
- Package name: `12-step-tracker` → `sobriety-waypoint`
- Expo slug: `twelve-step-tracker` → `sobriety-waypoint`
- URL scheme: `twelvesteptracker` → `sobrietywaypoint`
- iOS bundle: `com.volvoxllc.twelvesteptracker` → `com.volvoxllc.sobrietywaypoint`
- Android package: `com.volvoxllc.twelvesteptracker` → `com.volvoxllc.sobrietywaypoint`

**Content Language Transformation:**

- "12-step program" → "recovery program"
- "12 steps" → "recovery steps" / "program steps"
- "12-step work" → "recovery work"
- "step-related tasks" → "recovery-related tasks"
- Keep: "Step 1" through "Step 12" (specific numbered steps)
- Keep: "AA" and "Alcoholics Anonymous" references

**Infrastructure Reset:**

- New Expo project (fresh project ID)
- New Sentry project: `sobriety-waypoint`
- New EAS build profiles and credentials
- New app store submissions (iOS App Store, Google Play)
- Rename GitHub repository: `12-step-tracker` → `sobriety-waypoint`
- Recreate Serena project: "12-Step-Tracker" → "Sobriety-Waypoint"

### High-Level Strategy

**Phase 1: Preparation** - Create new Expo project, Sentry project, document old values
**Phase 2: Configuration** - Update all config files, identifiers, project setup
**Phase 3: Code & Content** - Rename user-facing text, code references
**Phase 4: Documentation** - Update all markdown files, guides
**Phase 5: Infrastructure** - GitHub rename, Serena recreation, EAS secrets
**Phase 6: Validation** - Tests, builds, end-to-end verification

---

## 2. File Changes Breakdown

### Configuration Files (8 files)

**package.json**

```json
{
  "name": "sobriety-waypoint",
  "homepage": "https://github.com/billchirico/sobriety-waypoint",
  "repository": {
    "type": "git",
    "url": "https://github.com/billchirico/sobriety-waypoint.git"
  },
  "bugs": {
    "url": "https://github.com/billchirico/sobriety-waypoint/issues"
  }
}
```

**app.json**

```json
{
  "expo": {
    "name": "Sobriety Waypoint",
    "slug": "sobriety-waypoint",
    "scheme": "sobrietywaypoint",
    "extra": {
      "eas": {
        "projectId": "<NEW_PROJECT_ID>"
      }
    },
    "ios": {
      "bundleIdentifier": "com.volvoxllc.sobrietywaypoint"
    },
    "android": {
      "package": "com.volvoxllc.sobrietywaypoint"
    },
    "plugins": [
      [
        "@sentry/react-native/expo",
        {
          "project": "sobriety-waypoint"
        }
      ]
    ]
  }
}
```

**app.config.ts**

```typescript
export default {
  name: 'Sobriety Waypoint',
  // ...
};
```

**CLAUDE.md**

- Line 3: "contributing to Sobriety Waypoint"
- Line 34: Update project description
- Line 48: Update folder structure diagram
- Line 108: Update Sentry project reference
- Update all repo URLs

**README.md, CONTRIBUTING.md, .github/CICD.md**

- Project name references throughout
- GitHub repository URLs
- Expo dashboard URLs
- Sentry project references

### Source Code Files (4 files)

**app/login.tsx**

```typescript
// Line ~100
<Text style={styles.title}>Sobriety Waypoint</Text>
```

**app/onboarding.tsx**

```typescript
// Line ~82
<Text style={styles.title}>Welcome to Sobriety Waypoint</Text>
```

**app/(tabs)/profile.tsx**

```typescript
// Line ~265
message: `Join me on Sobriety Waypoint! Use invite code: ${code}`

// Line ~1049
<Text style={styles.footerText}>Sobriety Waypoint v{packageJson.version}</Text>
```

### Test Files (2 files)

****tests**/app/onboarding.test.tsx**

```typescript
// Line ~80
expect(getByText('Welcome to Sobriety Waypoint')).toBeTruthy();
```

****tests**/app/login.test.tsx**

```typescript
// Line ~110
expect(getByText('Sobriety Waypoint')).toBeTruthy();
```

### Documentation Files (20+ files)

**Core Documentation:**

- `docs/README.md` - Title, project overview
- `docs/USER_GUIDE_SPONSEE.md` - Welcome section, feature descriptions
- `docs/USER_GUIDE_SPONSOR.md` - Welcome section, feature descriptions
- `docs/DEVELOPER_GUIDE.md` - Setup instructions
- `docs/TESTING.md` - Project references
- `docs/TESTING_IMPLEMENTATION_SUMMARY.md` - Project name
- `docs/SENTRY_SETUP.md` - All Sentry project references
- `docs/FACEBOOK_SIGNIN_SETUP.md` - App name references
- `docs/API_*.md` files - Project descriptions
- `.github/CICD.md` - Project references, URLs

**Plan Documents:**

- All `docs/plans/*.md` files - Update project name and context

**Test Flows:**

- `.maestro/flows/01-authentication.yaml` - Update text assertions
- `.maestro/flows/02-onboarding.yaml` - Update text assertions
- `.maestro/flows/07-step-progression.yaml` - Update description

**Memory Files:**

- `.serena/memories/project_overview.md` - Complete rewrite with new branding

---

## 3. Content Language Mapping

### Terminology Transformations

**Direct String Replacements:**

| Old                         | New                                 |
| --------------------------- | ----------------------------------- |
| "12-Step Tracker"           | "Sobriety Waypoint"                 |
| "12 Step Tracker"           | "Sobriety Waypoint"                 |
| "12-step program"           | "recovery program"                  |
| "12 steps"                  | "recovery steps"                    |
| "Twelve-Step"               | "Recovery"                          |
| "12-step work"              | "recovery work"                     |
| "step-related tasks"        | "recovery-related tasks"            |
| "work through the 12 steps" | "work through the recovery program" |
| "Full 12-step content"      | "Full recovery program content"     |

**Preserve (No Changes):**

- "Step 1", "Step 2", ... "Step 12" (when referring to specific numbered steps)
- "sponsor" and "sponsee" terminology
- "AA" and "Alcoholics Anonymous" references
- Table names in database schema
- Technical variable/function names

### Affected Files by Category

**High-Priority (User-Facing):**

- `docs/USER_GUIDE_SPONSEE.md`
- `docs/USER_GUIDE_SPONSOR.md`
- `docs/README.md`
- `README.md`

**Medium-Priority (Developer-Facing):**

- `docs/DEVELOPER_GUIDE.md`
- `docs/TESTING.md`
- `CONTRIBUTING.md`
- All `docs/plans/*.md` files

**Low-Priority (Reference):**

- `docs/API_*.md` files
- `.serena/memories/*.md` files

---

## 4. Infrastructure Changes

### Expo Project

**Current:**

- Project ID: `ca075b23-5398-4570-a6c4-286468f78eb1`
- Name: "12-Step Tracker"
- Slug: `twelve-step-tracker`
- Owner: `volvox-llc`

**New:**

- Project ID: `<GENERATE_NEW>` (via `eas init`)
- Name: "Sobriety Waypoint"
- Slug: `sobriety-waypoint`
- Owner: `volvox-llc` (unchanged)

**Migration Steps:**

1. Run `eas init` in project directory
2. Select account: `volvox-llc`
3. Create new project: "Sobriety Waypoint"
4. Copy new project ID to `app.json`
5. Document old project ID for reference
6. Keep old project active until new builds verified

### Sentry Integration

**Current:**

- Organization: `volvox`
- Project: `12-step-tracker`
- DSN: `<OLD_DSN>`

**New:**

1. Create new project in Sentry organization `volvox`
2. Project slug: `sobriety-waypoint`
3. Platform: React Native
4. Copy new DSN
5. Update environment variables:
   - `EXPO_PUBLIC_SENTRY_DSN=<NEW_DSN>`
   - `SENTRY_PROJECT=sobriety-waypoint`
6. Update EAS secrets:
   ```bash
   eas secret:create --name SENTRY_PROJECT --value "sobriety-waypoint"
   eas secret:create --name EXPO_PUBLIC_SENTRY_DSN --value "<NEW_DSN>"
   ```
7. Update `app.json` Sentry plugin config
8. Keep old project for historical data reference

### GitHub Repository

**Rename Strategy:**

- Current: `github.com/billchirico/12-step-tracker`
- New: `github.com/billchirico/sobriety-waypoint`
- Method: Rename via GitHub Settings → Repository → Rename
- Benefits: Preserves stars, issues, PRs, history, contributors
- Auto-redirect: GitHub redirects old URLs to new repo

**Post-Rename Updates:**

```bash
# Git remote updates automatically after first push
git push origin main
```

### Serena Project

**Current Project:**

- Name: "12-Step-Tracker"
- Path: `/Users/billchirico/Developer/Waypoint`
- Memories: 9 files (architecture, project_overview, etc.)

**Migration:**

1. Export/document current memory content
2. Deactivate current project
3. Create new project: "Sobriety-Waypoint"
4. Recreate memory files with updated content:
   - `project_overview.md` - New branding, terminology
   - `architecture.md` - Update folder path references
   - `tech_stack.md` - Update project name
   - `suggested_commands.md` - Update references
   - `completion_checklist.md` - Add rebrand verification
   - `recent_changes.md` - Document rebrand
   - Keep unchanged: `database_schema.md`, `code_style.md`, `mcp_usage_guidelines.md`

---

## 5. Implementation Execution Plan

### Phase 1: Preparation (Day 1, Morning)

**Tasks:**

1. Create new Expo project
   ```bash
   eas init
   # Select: volvox-llc account
   # Project name: Sobriety Waypoint
   ```
2. Document new project ID
3. Create new Sentry project `sobriety-waypoint`
4. Document new Sentry DSN
5. Create rollback documentation (save all old values)

**Validation:**

- [ ] New Expo project ID obtained
- [ ] New Sentry project created
- [ ] Old values documented

### Phase 2: Configuration Files (Day 1, Afternoon)

**Tasks:**

1. Update `package.json`:
   - `name`: `sobriety-waypoint`
   - `homepage`, `repository.url`, `bugs.url`: New GitHub URLs
2. Update `app.json`:
   - `name`: "Sobriety Waypoint"
   - `slug`: `sobriety-waypoint`
   - `scheme`: `sobrietywaypoint`
   - `expo.extra.eas.projectId`: New project ID
   - `ios.bundleIdentifier`: `com.volvoxllc.sobrietywaypoint`
   - `android.package`: `com.volvoxllc.sobrietywaypoint`
   - `plugins[sentry].project`: `sobriety-waypoint`
3. Update `app.config.ts`:
   - `name`: "Sobriety Waypoint"
4. Update `.env.example`:
   - `SENTRY_PROJECT=sobriety-waypoint`

**Validation:**

- [ ] Run `pnpm typecheck` (expect no errors)
- [ ] Run `pnpm lint` (expect no errors)

### Phase 3: Source Code (Day 1, Evening)

**Tasks:**

1. Update `app/login.tsx:100`: "Sobriety Waypoint"
2. Update `app/onboarding.tsx:82`: "Welcome to Sobriety Waypoint"
3. Update `app/(tabs)/profile.tsx:265`: "Join me on Sobriety Waypoint!"
4. Update `app/(tabs)/profile.tsx:1049`: "Sobriety Waypoint v{...}"
5. Update test files:
   - `__tests__/app/onboarding.test.tsx:80`
   - `__tests__/app/login.test.tsx:110`
6. Update Maestro flows:
   - `.maestro/flows/01-authentication.yaml`
   - `.maestro/flows/02-onboarding.yaml`

**Validation:**

- [ ] Run `pnpm test` (update snapshots if needed)
- [ ] Run `pnpm dev` (smoke test UI)

### Phase 4: Documentation (Day 2, Morning)

**Tasks:**

1. Update `CLAUDE.md`:
   - Line 3: "Sobriety Waypoint"
   - Line 34: Project description
   - Line 48: Folder structure
   - Line 108: Sentry project
   - All GitHub URLs
2. Update `README.md`:
   - Title, badges, description
   - All GitHub/Expo URLs
   - Feature descriptions (terminology)
3. Update `CONTRIBUTING.md`:
   - Project name, URLs
4. Update `.github/CICD.md`:
   - Project references, Expo URLs
5. Update `docs/README.md`:
   - Title, overview, terminology
6. Update user guides:
   - `docs/USER_GUIDE_SPONSEE.md`
   - `docs/USER_GUIDE_SPONSOR.md`
   - Apply terminology transformations
7. Update developer docs:
   - `docs/DEVELOPER_GUIDE.md`
   - `docs/TESTING.md`
   - `docs/TESTING_IMPLEMENTATION_SUMMARY.md`
8. Update integration docs:
   - `docs/SENTRY_SETUP.md` (all Sentry references)
   - `docs/FACEBOOK_SIGNIN_SETUP.md`
   - `docs/API_*.md` files
9. Update plan documents:
   - All `docs/plans/*.md` files

**Validation:**

- [ ] Search for remaining "12-step" references
- [ ] Verify all links are valid

### Phase 5: Infrastructure (Day 2, Afternoon)

**Tasks:**

1. Rename GitHub repository:
   - Go to Settings → Rename
   - New name: `sobriety-waypoint`
2. Update git remote:
   ```bash
   git push origin main
   # Remote updates automatically
   ```
3. Recreate Serena project:
   - Deactivate current project
   - Create "Sobriety-Waypoint"
   - Recreate memory files with new content
4. Update EAS secrets:
   ```bash
   eas secret:create --name SENTRY_PROJECT --value "sobriety-waypoint"
   eas secret:create --name EXPO_PUBLIC_SENTRY_DSN --value "<NEW_DSN>"
   ```
5. Update local `.env`:
   ```
   SENTRY_PROJECT=sobriety-waypoint
   EXPO_PUBLIC_SENTRY_DSN=<NEW_DSN>
   ```

**Validation:**

- [ ] GitHub repo accessible at new URL
- [ ] Old URL redirects correctly
- [ ] Serena project activated

### Phase 6: Validation & Testing (Day 2, Evening)

**Tasks:**

1. Full quality check:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test -- --coverage
   ```
2. Development build:
   ```bash
   pnpm dev
   # Test on web, iOS simulator, Android emulator
   ```
3. Preview build (EAS):
   ```bash
   eas build --platform all --profile preview
   ```
4. Verify new builds:
   - New bundle IDs in build artifacts
   - Sentry integration working
   - OAuth redirects configured correctly
5. Test key flows:
   - Authentication (email, Google, Facebook)
   - Onboarding
   - Main features
6. Run Maestro flows:
   ```bash
   pnpm maestro
   ```

**Validation:**

- [ ] All tests pass
- [ ] Dev build works on all platforms
- [ ] EAS preview builds succeed
- [ ] Sentry receives test events
- [ ] OAuth flows work with new bundle IDs
- [ ] Maestro flows pass

---

## 6. Risks & Mitigation

### Critical Risks

**1. Bundle Identifier Change**

- **Risk**: New bundle IDs create completely new apps
- **Impact**: Existing users won't receive updates; must download new app
- **Mitigation**:
  - Plan user communication strategy
  - Consider deprecation timeline for old app
  - Document migration path in app store listings

**2. Expo Project ID Change**

- **Risk**: Cannot reuse EAS credentials from old project
- **Impact**: Need new iOS certificates, Android keystores
- **Mitigation**:
  - Run `eas credentials` to regenerate
  - Document old project ID before deletion
  - Keep old project active until verified

**3. Sentry Historical Data**

- **Risk**: Old error data stays in previous project
- **Impact**: Lose trend analysis, can't reference old issues
- **Mitigation**:
  - Keep old Sentry project read-only
  - Export critical data before archiving
  - Document link to old project in new project

**4. GitHub External Links**

- **Risk**: External documentation may have hardcoded old URLs
- **Impact**: Some 404s for old links (GitHub redirects help most)
- **Mitigation**:
  - GitHub provides automatic redirects
  - Update known external references
  - Monitor 404 reports

**5. OAuth Redirect URIs**

- **Risk**: OAuth providers use bundle IDs for redirects
- **Impact**: Authentication breaks if not updated
- **Mitigation**:
  - Update Google OAuth allowed redirect URIs
  - Update Facebook OAuth allowed redirect URIs
  - Test all auth flows before production release

### Rollback Strategy

**If Critical Issues Found:**

**Before Infrastructure Phase (Phases 1-4):**

- Simple `git revert` of all commits
- No external systems affected
- Low risk, easy rollback

**After Infrastructure Phase (Phase 5):**

- Can revert code changes
- Can restore old GitHub repo name
- Cannot easily revert: new Expo project, new Sentry project
- Keep old Expo/Sentry projects active until verified

**Point of No Return:**

- After publishing new app to stores with new bundle IDs
- After users install new bundle ID version
- After deleting old Expo project

**Rollback Procedure:**

1. Revert all git commits
2. Restore old GitHub repository name
3. Switch back to old Expo project ID
4. Restore old Sentry configuration
5. Keep old app store listings active

---

## 7. Post-Implementation Tasks

### Required Follow-Up (Day 3+)

**App Store Submissions:**

1. Create new iOS App Store listing
   - Bundle ID: `com.volvoxllc.sobrietywaypoint`
   - App name: "Sobriety Waypoint"
   - New screenshots, description
2. Create new Google Play listing
   - Package: `com.volvoxllc.sobrietywaypoint`
   - App name: "Sobriety Waypoint"
   - New screenshots, description
3. Submit for review

**OAuth Provider Updates:**

1. Google Cloud Console:
   - Add new iOS bundle ID: `com.volvoxllc.sobrietywaypoint`
   - Add new Android package: `com.volvoxllc.sobrietywaypoint`
   - Update redirect URIs
2. Facebook Developer Console:
   - Add new iOS bundle ID
   - Add new Android package
   - Update OAuth redirect URIs
3. Apple Sign In (when implemented):
   - Register new bundle ID
   - Configure services

**User Communication:**

1. Plan announcement strategy
2. Update website/marketing materials
3. Consider migration incentives
4. Deprecation timeline for old bundle ID app

**Monitoring:**

1. Monitor Sentry for new errors
2. Watch app store review status
3. Track user adoption of new app
4. Monitor OAuth success rates

---

## 8. Breaking Changes Summary

### What Continues Working ✅

- Supabase database (no schema changes)
- Authentication providers (same configs, updated bundle IDs)
- User data (no migration required)
- Git history and commits
- GitHub issues and PRs
- Development workflow

### What Breaks ❌

- **Existing app installations**: New bundle IDs = new app, users must download fresh
- **Old Expo dashboard links**: New project ID needed
- **Old EAS builds**: New project, new credentials
- **OAuth without updates**: Must update redirect URIs for new bundle IDs
- **Old Sentry links**: New project slug

### Migration Path

**For Users:**

1. Download new app from app stores
2. Log in with existing credentials
3. All data syncs from Supabase (same backend)

**For Developers:**

1. Update local repository (git pull)
2. Update environment variables (new Sentry DSN)
3. Run `pnpm install` (package.json may have updates)
4. Use new Expo project for builds

**For CI/CD:**

1. Update GitHub secrets (new Sentry values)
2. Verify EAS builds with new project ID
3. Update deployment documentation

---

## 9. Success Criteria

### Phase Completion Checklist

**Phase 1: Preparation**

- [ ] New Expo project created with ID documented
- [ ] New Sentry project created with DSN documented
- [ ] Old values backed up for rollback

**Phase 2: Configuration**

- [ ] All config files updated
- [ ] Typecheck passes
- [ ] Lint passes

**Phase 3: Code**

- [ ] All source files updated
- [ ] All test files updated
- [ ] Tests pass
- [ ] Dev server runs without errors

**Phase 4: Documentation**

- [ ] All documentation files updated
- [ ] Terminology transformations applied
- [ ] No remaining "12-step" in user-facing docs
- [ ] All links validated

**Phase 5: Infrastructure**

- [ ] GitHub repository renamed
- [ ] Serena project recreated
- [ ] EAS secrets updated
- [ ] Environment variables updated

**Phase 6: Validation**

- [ ] All tests pass (unit + integration)
- [ ] Development builds work (iOS, Android, Web)
- [ ] EAS preview builds succeed
- [ ] Sentry integration verified
- [ ] OAuth flows tested
- [ ] Maestro E2E flows pass

### Final Acceptance Criteria

- [ ] App displays "Sobriety Waypoint" in all user-facing locations
- [ ] No references to "12-Step Tracker" in user-visible text
- [ ] Generic recovery terminology used throughout
- [ ] New bundle IDs in all builds
- [ ] All quality gates pass (lint, typecheck, tests, coverage ≥80%)
- [ ] Production build successfully created with new identifiers
- [ ] Sentry captures events in new project
- [ ] Documentation complete and accurate

---

## 10. Timeline Estimate

**Day 1 (6-8 hours):**

- Morning: Phase 1 (Preparation) - 2 hours
- Afternoon: Phase 2 (Configuration) - 2 hours
- Evening: Phase 3 (Code) - 2-4 hours

**Day 2 (6-8 hours):**

- Morning: Phase 4 (Documentation) - 3-4 hours
- Afternoon: Phase 5 (Infrastructure) - 1-2 hours
- Evening: Phase 6 (Validation) - 2-3 hours

**Day 3+ (Ongoing):**

- App store submissions - 2-3 hours
- OAuth provider updates - 1 hour
- User communication - ongoing
- Monitoring and support - ongoing

**Total Core Implementation**: 12-16 hours over 2 days

---

## Conclusion

This complete rebrand transforms "12-Step Tracker" into "Sobriety Waypoint" with fresh infrastructure, generic recovery language, and new technical identifiers. The phased approach minimizes risk while ensuring thorough validation at each step.

**Key Success Factors:**

1. Systematic execution following phase order
2. Validation checkpoints between phases
3. Rollback plan ready if issues arise
4. Post-implementation monitoring of OAuth and Sentry
5. Clear user communication about new app bundle

**Next Steps:**

1. Review and approve this design
2. Create detailed implementation plan with task breakdowns
3. Set up git worktree for isolated development
4. Begin Phase 1 execution
