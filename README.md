# Tiny D6 for Foundry VTT

**VERSION:** 14.0.0

This system for Foundry Virtual Tabletop facilitates playing using the Tiny D6 minimalist RPG system. The system is currently in beta so breaking changes may happen on occasion.

[[_TOC_]]

Initially developed for my own home game using the <cite>Tiny Cthulhu</cite> ruleset, I plan to continue adding other Tiny D6 systems (<cite>Tiny Dungeon</cite>, <cite>Tiny Supers</cite>, <cite>Tiny Frontiers</cite>, etc.) in the future.

## Introduction

Tiny D6 is a minimalist ruleset for playing tabletop RPGs in a variety of genres. For more information about the system and the products available, checkout [Gallant Knight Games](https://www.gallantknightgames.com/tinyd6/).

## Installation

Manifest URL: `https://github.com/jero-rodriguez/tinyd6/releases/latest/download/system.json`

The system should now show up in your foundry and can be used to create a new world.

## Releases and versioning

Tiny D6 follows [semantic versioning](https://semver.org/). The system version
is independent from the supported Foundry core version: Foundry compatibility is
declared only by `compatibility.minimum` and `compatibility.verified` in
`system.json`.

- Use `MAJOR.MINOR.PATCH` for stable releases and append `-alpha.N`, `-beta.N`,
  or `-rc.N` for prereleases.
- Tag each release as `vMAJOR.MINOR.PATCH` (or its prerelease equivalent).
- Push the release tag to GitHub. The
  [release workflow](.github/workflows/release.yml) validates the version,
  builds the system, and publishes a GitHub Release containing `system.json`
  and a system archive named `tinyd6.zip`. The stable manifest URL above always
  resolves to the newest published release.
- Update `RELEASE-NOTES.md`, `system.json`, and `package.json` to the same
  version before creating the release tag. Changes to Foundry support update
  the compatibility fields, not the system version by themselves.

For example, after preparing version `14.0.0` on `main`:

```powershell
git tag v14.0.0
git push origin v14.0.0
```

### Planned automatic versioning

The next release-process improvement is to use
[Release Please](https://github.com/googleapis/release-please-action). It will
run on pushes to `main`, inspect Conventional Commit messages since the prior
release, and open a release pull request with the calculated version, updated
release notes, and a matching tag once that pull request is merged. The existing
tag-triggered release workflow will then build and publish the Foundry assets.

Branch names express where work is headed; they do not set the semantic version.
The merged commit type determines the version increment:

| Branch or commit | Release behavior |
| --- | --- |
| `feature/*` or `fix/*` | Pull request only; no release is created directly from the branch. |
| `main` | Release Please opens a stable release pull request when merged Conventional Commits require one. |
| `beta` (when configured) | A separate Release Please workflow can create `-beta.N` prereleases without updating the stable release. |
| `fix:` | PATCH increment. |
| `feat:` | MINOR increment. |
| `feat!:` or a `BREAKING CHANGE:` footer | MAJOR increment. |

Release Please is not enabled yet. Until it is configured, maintainers must
continue updating the version files and pushing the release tag manually as
described above.

## Feedback

Constructive feedback is welcome! You can submit an issue through the
[GitHub issue tracker](https://github.com/jero-rodriguez/tinyd6/issues).

## Contributing

I do occasionally accept contributions as merge requests.  However, you might want to check with me first
before you do a lot of work...

Contributions should be submitted as pull requests to the `main` branch and
should address one subject: one bug fix or feature. Please follow the
repository's K&R coding style and formatting conventions, including opening
braces on the same line as the statement that introduces the block.

Please only contribute issues slated for the next milestone (when one is
planned), and include the issue number in the pull-request title. Thanks!
