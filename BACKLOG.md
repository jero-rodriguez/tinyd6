# Tiny D6 System Backlog

## Purpose

This backlog defines the path from the current Foundry VTT v12 Tiny D6 system to a
maintainable Foundry VTT v14 system that can support multiple Tiny D6 game lines
with game-specific character sheets and optional content compendia.

The canonical technical reference for every implementation decision is the
[Foundry VTT API documentation](https://foundryvtt.com/api/). Use public APIs
only. Do not depend on private, internal, or undocumented underscore-prefixed
APIs.

## Product Decisions

- The system supports several Tiny D6 game lines through named **game profiles**.
- A World setting selects the active profile for new documents, default sheets,
  rules, styling, and content browsing.
- Existing documents retain their own game-line subtype. Changing the active
  profile must never silently transform or invalidate existing characters.
- A game profile gets its own sheet layout. Shared UI is implemented as reusable
  components, not a single template with a large set of game-line conditionals.
- Data schemas are implemented with `TypeDataModel`; `template.json` is a
  transitional legacy format and will be removed after migration.
- Content is authored from version-controlled source data and distributed as
  Foundry compendium packs only after the document schemas are stable.

## Milestone 0 — Delivery Foundation

### M0-01: Establish a v14 development environment

- [ ] Install Foundry VTT v14 in a separate development installation and User
  Data directory.
- [ ] Record the exact Foundry build used for development and CI validation.
- [ ] Create a clean test World with no third-party modules enabled.
- [ ] Document the local installation and test workflow in `README.md`.

**Acceptance criteria:** A contributor can start Foundry v14, install this
system from the local checkout, and open a clean test World.

### M0-02: Build a regression fixture World

- [ ] Create representative `hero` and `npc` actors.
- [ ] Create every current Item type, both as world Items and embedded Items.
- [ ] Exercise equipped weapons and armor, wounds, corruption, advancement,
  descriptions, and all current settings.
- [ ] Add linked and unlinked Tokens for representative actors.
- [ ] Export or archive the fixture source data before migration work begins.
- [ ] Write a concise manual regression checklist.

**Acceptance criteria:** The project has reproducible v12 data and expected
behavior against which the v14 migration can be tested.

### M0-03: Add quality gates

- [ ] Add JavaScript linting appropriate for native ES modules.
- [ ] Add manifest validation.
- [ ] Add a CSS build check.
- [ ] Add a CI job that assembles the exact release archive.
- [ ] Add a smoke-test checklist for a fresh archive installation.

**Acceptance criteria:** Pull requests cannot publish an archive with an invalid
manifest, missing built CSS, or missing required runtime files.

## Milestone 1 — Foundry VTT v14 Migration

### M1-01: Modernize the system manifest and release archive

- [x] Update `system.json` for Foundry VTT v14 compatibility.
- [x] Add the system package type and explicit `documentTypes` definitions.
- [x] Declare any server-sanitized HTML fields required by the new data models.
- [x] Remove the duplicate standalone loading of `module/settings.js`; it is
  already imported by the entry module.
- [ ] Update manifest metadata, release URLs, and semantic versioning strategy.
- [x] Update the CI runtime for Foundry v14-compatible tooling.
- [x] Include `template.json` during the temporary compatibility period.
- [ ] Ensure the release archive includes `assets`, `css`, `fonts`, `lang`,
  `module`, `templates`, `packs` when introduced, and all root metadata files.

**Acceptance criteria:** A freshly installed archive is recognized as a Foundry
v14 system and does not report missing runtime assets or metadata.

### M1-02: Introduce typed document data models

- [x] Create a shared Actor data-model base class for Tiny D6 fields.
- [x] Create Actor type data models for the existing hero and NPC data.
- [x] Create a shared Item data-model base class.
- [x] Create data models for weapon, armor, gear, heritage, and trait Items.
- [x] Define all persisted fields with Foundry `DataField` types, defaults, and
  validation constraints.
- [x] Use `HTMLField` for rich-text fields such as descriptions and heritage
  traits.
- [x] Register the models in `CONFIG.Actor.dataModels` and
  `CONFIG.Item.dataModels` during `init`.
- [x] Add localized names for every Actor and Item subtype.
- [x] Move derived values such as remaining XP and total armor into
  `prepareDerivedData` or a dedicated rules service.
- [ ] Remove `template.json` once all legacy documents migrate successfully.

**Acceptance criteria:** Newly created documents have validated typed `system`
data, and all current fields are available without `template.json`.

### M1-03: Migrate existing World data

- [ ] Define an internal schema-version strategy.
- [ ] Implement idempotent migrations for World Actors, World Items, and
  embedded Items.
- [ ] Cover unlinked Token Actor Delta data where applicable.
- [ ] Map legacy `template.json` data paths to the new models.
- [ ] Detect the legacy game line from saved World settings.
- [ ] Prompt the GM to choose a profile when legacy data is ambiguous.
- [ ] Create a backup or require an explicit GM confirmation before write
  migrations.
- [ ] Report migrated, skipped, and failed documents.
- [ ] Test migrations with the fixture World.

**Acceptance criteria:** A copy of the v12 fixture World opens in v14 with
usable actors, Items, sheets, and tokens; re-running the migration causes no
additional changes.

### M1-04: Replace legacy sheets with ApplicationV2 sheets

- [x] Replace `ActorSheet` extensions with
  `HandlebarsApplicationMixin(ActorSheetV2)`.
- [x] Replace `ItemSheet` extensions with
  `HandlebarsApplicationMixin(ItemSheetV2)`.
- [x] Register sheets through `DocumentSheetConfig.registerSheet`.
- [x] Replace legacy `defaultOptions` with `DEFAULT_OPTIONS`.
- [x] Move template context construction to `_prepareContext` and per-part
  context methods.
- [x] Define `PARTS` for each sheet instead of monolithic rendering where it
  improves composition.
- [x] Replace jQuery listener binding with declarative `data-action` handlers
  and standard DOM events.
- [x] Ensure non-submit buttons declare `type="button"`.
- [ ] Preserve permissions, enriched text, Item creation, deletion, and
  equipment interactions.

**Acceptance criteria:** Hero, NPC, and all Item sheets use v14 sheet APIs with
no legacy sheet API warnings in the browser console.

### M1-05: Modernize the floating die roller and dice workflow

- [x] Replace `FormApplication` with an ApplicationV2-based application.
- [x] Preserve client-specific position persistence.
- [x] Extract roll formula construction from the UI layer.
- [x] Localize every chat result string.
- [ ] Preserve disadvantage, standard, advantage, focus, and marksman behavior.
- [ ] Review use of `Roll`, `ChatMessage`, and roll data against the v14 API.
- [ ] Remove unused socket code or implement it with a documented use case.

**Acceptance criteria:** All supported rolls produce localized chat messages and
the floating roller works after reload, reconnect, and profile changes.

### M1-06: Validate v14 behavior

- [ ] Test as GM, owner, observer, and non-owner player.
- [ ] Test create, edit, delete, equip, and drag/drop operations.
- [ ] Test rich text, images, localization, and all settings.
- [ ] Test the fixture World migration and a new v14 World.
- [ ] Resolve public API deprecation warnings and runtime errors.
- [ ] Publish v14 beta release notes with upgrade guidance.

**Acceptance criteria:** The v14 beta passes the regression checklist without
console errors and can be installed into a clean World.

## Milestone 2 — Multi-Game Profile Architecture

### M2-01: Define the game-profile contract

- [ ] Add a `GameProfileRegistry` module.
- [ ] Define a profile interface containing at least:
  - `id`, localized `label`, and description.
  - Supported Actor and Item subtypes.
  - Sheet classes and templates.
  - Rules service and optional rule settings.
  - Theme and visual assets.
  - Content-pack identifiers.
  - Profile schema version.
- [ ] Add an explicit fallback profile for unsupported or legacy documents.
- [ ] Keep profile lookup in one service; do not scatter game-line string checks
  across templates and sheets.

**Acceptance criteria:** Any subsystem can resolve the active profile and a
document's profile from a stable public interface.

### M2-02: Add active-profile World configuration

- [ ] Register a World-scoped `gameLine` setting.
- [ ] Add a configuration application or settings menu for profile selection.
- [ ] Show a localized name, description, and compatibility warning for each
  available profile.
- [ ] Reload the client after profile changes where sheet registration requires
  it.
- [ ] State clearly that the setting controls defaults for new documents and UI,
  not implicit conversion of existing documents.
- [ ] Add separate, explicit conversion tooling only if profile conversion is
  later required.

**Acceptance criteria:** A GM can select an active game line and newly created
documents use its defaults without altering existing documents.

### M2-03: Define game-line document subtypes

- [ ] Define Actor subtypes per game line, for example:
  - `dungeonHero` and `dungeonNpc`.
  - `frontiersHero` and `frontiersNpc`.
  - `cthulhuInvestigator` and `cthulhuNpc`.
- [ ] Inherit each subtype model from shared Tiny D6 base models.
- [ ] Keep a shared Item subtype only when its data shape and behavior are
  genuinely shared.
- [ ] Create game-specific Item subtypes where their schema or rules differ.
- [ ] Add migration mapping from current `hero` and `npc` documents to an
  appropriate profile subtype.
- [ ] Make the active profile control the default creation choices.

**Acceptance criteria:** Documents from two profiles can coexist in one World
and each retains its appropriate schema and sheet.

### M2-04: Build profile-specific character sheets

- [ ] Create a base sheet that provides only shared behavior and components.
- [ ] Create a dedicated Hero sheet for each supported game profile.
- [ ] Create a dedicated NPC sheet for each profile where necessary.
- [ ] Use profile-specific layout parts, navigation, labels, resources, and
  artwork.
- [ ] Keep common inventory, header, roll, and editor components reusable.
- [ ] Namespace CSS by profile, for example `.tinyd6--frontiers`.
- [ ] Produce and approve wireframes before implementing each new layout.
- [ ] Verify desktop and narrow-window behavior.

**Acceptance criteria:** Tiny Dungeon and Tiny Frontiers visibly have different,
purpose-built sheets while sharing stable core components.

### M2-05: Extract profile rules services

- [ ] Define a shared Tiny D6 roll service interface.
- [ ] Implement profile-specific modifiers, thresholds, resources, initiative,
  damage, armor, and optional mechanics.
- [ ] Move rules out of Handlebars templates and sheet event handlers.
- [ ] Make optional settings profile-owned where they are not universal.
- [ ] Add unit tests for each profile's rules.

**Acceptance criteria:** Adding a new profile does not require modifying the
rules implementation of existing profiles.

### M2-06: Deliver profiles incrementally

- [ ] Complete Tiny Cthulhu and Tiny Dungeon as the first vertical slice.
- [ ] Use the resulting feedback to revise the profile contract.
- [ ] Add Tiny Frontiers as the second independent validation.
- [ ] Add remaining game lines one profile at a time.
- [ ] For every profile, deliver schema, sheets, rules, localization, assets,
  migration, tests, and compendium mapping together.

**Acceptance criteria:** Every supported game line meets the same definition of
done and is independently testable.

## Milestone 3 — Compendium Content Pipeline

### M3-01: Establish content ownership and licensing

- [ ] Record the source, edition, rights holder, and license for every proposed
  content collection.
- [ ] Identify content that may ship inside the base system.
- [ ] Identify content that must ship as optional modules or must not be
  redistributed.
- [ ] Add license and attribution files to every distributable content package.

**Acceptance criteria:** No content enters a release without an explicit
distribution decision and attribution record.

### M3-02: Define compendium taxonomy

- [ ] Create stable technical pack names and localized labels.
- [ ] Separate packs by Foundry document type; never mix Actor, Item,
  JournalEntry, or RollTable documents in one pack.
- [ ] Group related packs with `packFolders`.
- [ ] Define a per-profile pack map, for example traits, heritages, bestiary,
  tables, and rules journals.
- [ ] Add optional 290x70 pack banners.

**Acceptance criteria:** Every profile can declare the packs it owns and the
sidebar presents them in predictable folders.

### M3-03: Define the authoring source format

- [ ] Agree on a machine-readable source format: JSON, YAML, CSV, or a
  combination with documented conversion rules.
- [ ] Require: stable ID, name, game line, document type/subtype, source
  citation, fields, image, tags, translations, and related-document references.
- [ ] Add schemas and validation for the source data.
- [ ] Keep human-readable source data as the version-control canonical form.
- [ ] Define stable UUID conventions for cross-document links.

**Acceptance criteria:** Content supplied by an editor can be validated before
it reaches Foundry.

### M3-04: Build and integrate LevelDB packs

- [ ] Add a `packs/` directory and mark its binary contents appropriately for
  version control.
- [ ] Add one `packs` manifest entry for each pack with `name`, `label`, `path`,
  `type`, and `system`.
- [ ] Create or import the documents in a clean Foundry v14 authoring World.
- [ ] Preserve document IDs when references require stable links.
- [ ] Generate LevelDB packs from the canonical source data.
- [ ] Include packs and referenced assets in CI release archives.
- [ ] Test the archive in a new World with no third-party modules.

**Acceptance criteria:** A fresh system installation exposes working system
compendia that can be opened, searched, and imported without missing assets or
broken links.

### M3-05: Add a profile-aware content browser

- [ ] Add a browser application filtered to the active profile.
- [ ] Support search by name, type, category, tag, and source.
- [ ] Clearly label content from another profile.
- [ ] Support drag/drop or explicit import into compatible Actors.
- [ ] Keep raw compendium packs accessible through Foundry's normal sidebar.

**Acceptance criteria:** A GM can find and import only the relevant content for
the active game line without losing access to other installed packs.

### M3-06: Define content update and migration policy

- [ ] Preserve stable document IDs whenever possible.
- [ ] Validate UUID references during build.
- [ ] Document how pack updates affect user-edited imports.
- [ ] Version schema changes separately from content changes.
- [ ] Provide migrations for pack documents when schemas change.
- [ ] Publish content changelogs with every release.

**Acceptance criteria:** Content updates do not silently break links or corrupt
documents imported into user Worlds.

## Required Input for Each New Game Profile

- [ ] Game title, edition, and distribution rights.
- [ ] Actor categories and character-sheet sections.
- [ ] Resources, derived values, and advancement rules.
- [ ] Item categories, fields, and interactions.
- [ ] Roll, damage, armor, initiative, and optional-rule specifications.
- [ ] Required terminology and translations.
- [ ] Approved visual assets and layout direction.
- [ ] Content list with source citations, ownership, and licensing.
- [ ] Desired compendium grouping and relationships.

## Recommended Delivery Order

1. Complete Milestone 0.
2. Deliver Milestone 1 as a Foundry v14 beta preserving current Tiny Cthulhu
   behavior.
3. Implement the profile registry and active-profile setting.
4. Deliver Tiny Cthulhu and Tiny Dungeon as the first profile vertical slice.
5. Stabilize document schemas.
6. Deliver the compendium source pipeline and one small content pack.
7. Add Tiny Frontiers as the second profile validation.
8. Add remaining game lines and content packs incrementally.

## Definition of Done

A backlog item is complete only when it has:

- An implementation using Foundry's public v14 API.
- Localization for all player-visible strings.
- Manual regression coverage and automated coverage where practical.
- Updated release/build configuration if new runtime files are added.
- Documentation for user-visible behavior and migration implications.
- A clean-install test when the item affects packaging, documents, or packs.
