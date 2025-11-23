# CI/CD Pipeline Documentation

This project uses GitHub Actions for continuous integration and continuous deployment.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on every pull request and push to `main` or `develop` branches.

**Jobs:**
- **Test**: Runs tests across Node.js versions 18.x and 20.x
  - Linting with ESLint
  - Type checking with TypeScript
  - Unit and integration tests with Vitest
  - Code coverage reporting to Codecov
- **Build**: Creates production build and uploads artifacts
  - Validates build succeeds
  - Stores build artifacts for 7 days

**Triggers:**
- Pull requests to `main` or `develop`
- Direct pushes to `main` or `develop`

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)

Deploys to production on pushes to `main` branch.

**Jobs:**
- **Test**: Runs full test suite before deployment
- **Deploy to Vercel**: 
  - Installs Vercel CLI
  - Pulls environment configuration
  - Builds project with production environment variables
  - Deploys to Vercel production

**Triggers:**
- Push to `main` branch
- Manual trigger via workflow_dispatch

### 3. Preview Workflow (`.github/workflows/preview.yml`)

Creates preview deployments for pull requests.

**Jobs:**
- **Deploy Preview**:
  - Builds and deploys to Vercel preview environment
  - Posts preview URL as PR comment

**Triggers:**
- Pull requests to `main`

## Required GitHub Secrets

Set these in your repository settings (Settings → Secrets and variables → Actions):

### Vercel Deployment
```
VERCEL_TOKEN              # Vercel authentication token
VERCEL_ORG_ID            # Organization ID (in .vercel/project.json)
VERCEL_PROJECT_ID        # Project ID (in .vercel/project.json)
```

### Application Secrets
```
VITE_SUPABASE_URL        # Supabase project URL
VITE_SUPABASE_ANON_KEY   # Supabase anonymous key
VITE_SENTRY_DSN          # Sentry DSN (optional)
VITE_HUGGINGFACE_API_KEY # Hugging Face API key (optional)
```

### Optional
```
CODECOV_TOKEN            # Codecov token for coverage reports
```

## Setting Up Vercel Integration

### 1. Get Vercel Token
1. Go to https://vercel.com/account/tokens
2. Create a new token with appropriate scope
3. Add as `VERCEL_TOKEN` secret in GitHub

### 2. Link Project to Vercel
```bash
# Install Vercel CLI locally
npm i -g vercel

# Login and link project
vercel login
vercel link

# This creates .vercel/project.json with ORG_ID and PROJECT_ID
```

### 3. Add Vercel IDs to GitHub
Copy `orgId` and `projectId` from `.vercel/project.json` to GitHub secrets:
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Workflow Behavior

### Pull Requests
1. CI workflow runs tests and build
2. Preview workflow deploys to Vercel preview environment
3. Preview URL is commented on PR

### Main Branch Push
1. CI workflow runs tests and build
2. Deploy workflow runs tests again
3. Production deployment to Vercel

### Manual Deployment
Trigger production deployment manually:
1. Go to Actions tab
2. Select "Deploy to Production" workflow
3. Click "Run workflow"

## Status Badges

Add these to your README.md:

```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/badge.svg)
![Deploy](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Deploy%20to%20Production/badge.svg)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
```

## Branch Protection Rules

Recommended settings for `main` branch:

1. **Require pull request before merging**
   - Require approvals: 1
   - Dismiss stale reviews on new commits

2. **Require status checks to pass**
   - `test (18.x)`
   - `test (20.x)`
   - `build`

3. **Require branches to be up to date before merging**

4. **Do not allow bypassing the above settings**

## Local Development

All CI checks can be run locally:

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Run tests
npm test

# Generate coverage
npm run test:coverage

# Build project
npm run build
```

## Troubleshooting

### Build Fails on CI but Works Locally
- Ensure environment variables are set in GitHub Secrets
- Check Node.js version matches (use 20.x)
- Clear npm cache: `npm ci` instead of `npm install`

### Vercel Deployment Fails
- Verify `VERCEL_TOKEN` is valid
- Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
- Ensure project is properly linked: `vercel link`

### Tests Fail on CI
- Check for environment-specific issues
- Verify all dependencies are in `package.json`
- Review test logs in GitHub Actions

### Coverage Upload Fails
- Ensure `CODECOV_TOKEN` is set (if repo is private)
- Check Codecov integration is enabled
- Verify coverage files are generated

## Performance Optimization

### Cache Strategy
The workflows use npm caching to speed up builds:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

### Parallel Jobs
Tests run in parallel across Node versions for faster feedback.

### Artifact Retention
Build artifacts are kept for 7 days for debugging purposes.

## Security Best Practices

1. **Never commit secrets** - Use GitHub Secrets
2. **Use specific action versions** - `@v4` instead of `@latest`
3. **Limit token permissions** - Use fine-grained PATs
4. **Review dependency updates** - Use Dependabot
5. **Scan for vulnerabilities** - `npm audit`

## Future Enhancements

Consider adding:
- [ ] Lighthouse CI for performance testing
- [ ] Visual regression testing with Percy
- [ ] Automated security scanning with Snyk
- [ ] Slack/Discord notifications
- [ ] Deployment rollback automation
- [ ] Performance budgets
- [ ] Database migration checks
