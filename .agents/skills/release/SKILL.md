---
name: release
description: "Use when cutting a release, publishing, bumping the version, tagging, or updating the CHANGELOG of @capotej/tools. Runs the full pipeline: pre-flight gates, version inference, CHANGELOG, bump, tag, OIDC publish, verify."
version: 1.0.0
author: Julio Capote
license: BSD-3-Clause
metadata:
  hermes:
    tags: [release, npm, publish, changelog, oidc]
    related_skills: []
---

# Release Skill for `@capotej/tools`

Ports capotej/patterns P017 to this repo. Publishing is OIDC trusted
publishing triggered by pushing a `v*` tag — there is no manual
`npm publish` and no OTP gate. The tag push **is** the publish, so every
gate happens **before** the tag is pushed.

## When to Use

- "cut a release", "release X.Y.Z", "bump to X", "publish", "tag this release",
  "update the changelog", or any version-bump + publish intent.
- Always use this skill for release work — do not run release steps
  (`npm publish`, version bumps, tags) ad hoc.

Don't use for: unreleased chore/doc commits to main (no version involved).

## Step 1: Pre-flight (abort on failure)

```bash
git fetch origin
git status --porcelain                  # must be empty
git rev-parse main origin/main          # must match
gh auth status                          # must be logged in
eval "$(mise activate bash)" && pnpm build && pnpm lint && pnpm typecheck && pnpm format:check
```

Also verify the README tools table is current: every file in
`src/commands/` has a row in `README.md`'s Tools table, and no row points
at a deleted command. Abort and fix the README first if not — releasing
user-visible changes with a stale README ships undocumented behavior.

Completion: all commands pass, working tree clean, README table matches
`ls src/commands/`.

## Step 2: Determine the new version

If the user named a version, use it. Otherwise infer from commits since the
last tag:

- **minor** — a new subcommand was added (a new file in `src/commands/`)
- **patch** — everything else: fixes, docs, chore, new flags on existing tools
- **major** — only on explicit request or a genuinely breaking change

State the chosen version and the reasoning to the user before proceeding.
Completion: version chosen and announced.

## Step 3: Collect commits since last tag

```bash
LAST_TAG=$(git describe --tags --abbrev=0)
git log ${LAST_TAG}..HEAD --oneline
```

Completion: full bullet list of commits in hand (feeds Steps 1 and 4).

## Step 4: Update CHANGELOG.md

Insert a new entry immediately after the `# Changelog` header — never append
below older entries. The entry is **not** a raw commit dump: lead with 1–3
sentences of prose summarizing what changed and why a user should care,
with a concrete `npx ...` example for any new tool or flag. Then the commit
bullets.

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Summary

<prose: what changed, why it matters, `npx @capotej/tools <cmd>` example>

### Changes

- <short-hash> <subject>
```

Add a `### Dependency Updates` subsection only when `package.json` /
`pnpm-lock.yaml` moved: `- <pkg> from <old> to <new>` per package.

Completion: entry written, dated today, inserted directly under the header.

## Step 5: Bump `version` in `package.json` by hand

Edit the `version` field directly. **Never `npm version`** — it creates its
own git commit and fights the release-commit flow.

Completion: `package.json` shows the new version; `git diff` shows exactly
`package.json` + `CHANGELOG.md` modified.

## Step 6: Re-verify

```bash
eval "$(mise activate bash)" && pnpm build && pnpm lint && pnpm format:check
```

Completion: all green after the edits (oxfmt has opinions about markdown
tables — let `pnpm format` fix, then re-lint).

## Step 7: Commit, then push main + tag together

```bash
git add package.json CHANGELOG.md
git commit -m "release v<X.Y.Z>"
git tag v<X.Y.Z>
git push origin main v<X.Y.Z>
```

The tag push triggers `.github/workflows/release.yml`, which builds and
publishes to npm via OIDC. A failed workflow never leaves an orphan npm
version — but a wrong tag means a wrong published version, so double-check
the tag name before the push.

Completion: commit + tag pushed; `git status` clean.

## Step 8: Watch the Release workflow to completion

```bash
gh run list --workflow=release.yml --limit 1
gh run watch <run-id> --exit-status
```

If a job fails: diagnose, fix, and re-release as `<X.Y.Z+1>` (never move or
delete an already-pushed tag).

Completion: the run is fully green.

## Step 9: Verify the artifact on npm

```bash
npm view @capotej/tools version dist-tags.latest
```

Registry propagation can lag ~30s behind a green workflow — re-check before
declaring failure. Optionally smoke-test: `npx -y @capotej/tools@<X.Y.Z> doctor`.

Completion: both `version` and `dist-tags.latest` report `<X.Y.Z>`.

## Step 10: Create the GitHub release

```bash
gh release create v<X.Y.Z> --title "v<X.Y.Z>" --notes "<Summary prose from Step 4>"
```

The tag already exists, so this only creates the release page — it does not
re-trigger the publish workflow.

Completion: release visible on the repo's releases page with the summary as
notes.

## Common Pitfalls

1. **Tagging with unpushed main.** The workflow checks out the tag; if main's
   release commit isn't on the remote the workflow still publishes from the
   tag — but push both together (Step 7) so main and the tag never diverge.
2. **Using `npm version`.** It commits on its own and breaks the
   release-commit-then-tag order. Edit `package.json` by hand.
3. **Dumping raw commits as the changelog.** Lead with prose; commits are the
   appendix, not the entry.
4. **Minor bumps for flags.** In this repo a new subcommand is minor;
   a new flag on an existing tool is patch. Don't escalate automatically.
5. **Reporting success while the Release workflow is red.** "Tag pushed" ≠
   "released". The release is complete only after Steps 8–10 all pass.
6. **Re-moving tags.** Never delete/repush a published version's tag; cut a
   new patch release instead.

## Verification Checklist

- [ ] Pre-flight: clean tree, main == origin/main, all pnpm gates green
- [ ] README tools table matches `src/commands/`
- [ ] Version chosen, stated, and justified (new tool → minor, else patch)
- [ ] CHANGELOG entry: prose summary + example, then commit bullets
- [ ] `package.json` bumped by hand; diff is exactly package.json + CHANGELOG
- [ ] Gates re-run green after edits
- [ ] `release v<X.Y.Z>` commit created, `v<X.Y.Z>` tag pushed with main
- [ ] Release workflow fully green
- [ ] `npm view` shows the new version as latest
- [ ] GitHub release created with summary notes
