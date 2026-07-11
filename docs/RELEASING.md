# Releasing

This repo uses [Changesets](https://github.com/changesets/changesets) for
versioning/changelogs and a GitHub Actions workflow for publishing to npm.
Packages are published independently under the `@appbuildersph` scope.

## 1. Record a changeset

Whenever a PR changes the public behavior of one or more packages, add a
changeset describing it:

```bash
pnpm changeset
```

This prompts for which packages changed, the bump type (`patch` / `minor` /
`major`), and a summary. It writes a markdown file to `.changeset/`. Commit
that file with your PR — it does **not** bump versions or publish anything by
itself.

Bump type guide:

- **patch** — bug fixes, internal wiring changes, docs
- **minor** — new config options / new public API that's backward-compatible
- **major** — breaking changes to a package's public API

## 2. Version packages

When you're ready to cut a release, apply the staged changesets:

```bash
pnpm changeset version
```

This bumps `package.json` versions, updates each affected package's
`CHANGELOG.md`, bumps internal `workspace:*` dependents as needed (configured
as `patch` in `.changeset/config.json`), and deletes the consumed changeset
files. Review the diff, then commit it directly to `main` (or via PR):

```bash
git add packages .changeset
git commit -m "Version packages"
git push origin main
```

## 3. Publish

Publishing happens in CI, not locally. Pushing to `main` triggers
[`.github/workflows/release.yml`](../.github/workflows/release.yml), which:

1. Installs deps and runs `pnpm build` across all packages.
2. Runs [`changesets/action`](https://github.com/changesets/action), which
   publishes any package whose `package.json` version isn't yet on the npm
   registry, authenticating via **npm OIDC trusted publishing** — no
   long-lived npm token stored in CI.

You do not need — and should not use — a local `npm publish` for this repo's
packages; `pnpm release` (`build` + `changeset publish`) exists as a local
fallback but requires an authenticated `npm` session and is not the normal
path.

### Requirements

- **Trusted publisher configured on npmjs.com**, per package: on each
  `@appbuildersph/<name>` package's npm settings page, add a trusted
  publisher pointing at this repo (`<org>/<repo>`) and workflow file
  `.github/workflows/release.yml` (no GitHub environment needed). This lets
  npm verify the GitHub Actions OIDC token without a stored secret. Requires
  npm CLI >= 11.5.1 in CI (the workflow pins `npm install -g npm@latest`)
  and the `id-token: write` permission (already set on the `release` job).
- **Never paste npm tokens into chat, issues, PRs, or commit them to the
  repo.** If a token is ever exposed, revoke it immediately at
  https://www.npmjs.com/settings/~/tokens.

> **Why OIDC instead of a token:** npm is deprecating 2FA-bypass granular
> access tokens for publishing — they lose the ability to skip 2FA for
> sensitive operations starting ~Aug 2026, and lose direct publish rights
> entirely by ~Jan 2027 (see the
> [npm install-time security & GAT/bypass-2FA deprecation changelog](https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/)).
> Trusted publishing (OIDC) removes the long-lived token from the picture
> altogether, so this repo uses it instead of an `NPM_TOKEN` secret.

### Checking a release

Watch the run at:

```
https://github.com/<org>/<repo>/actions/workflows/release.yml
```

If a run fails with a 404 or 403 on publish, it usually means the trusted
publisher isn't configured for that package (or the workflow file path/repo
doesn't match what's registered on npmjs.com) — verify the trusted publisher
settings for the failing package and re-push (an empty commit is enough to
retrigger, since the workflow only runs on `push` to `main`).

## Summary

| Step | Command | Where |
| --- | --- | --- |
| Record a change | `pnpm changeset` | local, per-PR |
| Bump versions + changelogs | `pnpm changeset version` | local, before release |
| Publish to npm | push to `main` | GitHub Actions (automatic) |
