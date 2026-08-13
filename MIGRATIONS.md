# Data migration strategy

Tiny D6 migrations are versioned independently of both the system release and
Foundry core version. `MIGRATION_SCHEMA_VERSION` is the latest supported data
shape. Increment it only when a persisted Tiny D6 document shape changes.

## Version markers

- `flags.tinyd6.schemaVersion` is stored on every successfully migrated Actor,
  Item, embedded Item, and Actor Delta. This is the authoritative per-document
  marker and makes a migration retry-safe.
- The hidden World setting `tinyd6.schemaVersion` records the latest migration
  that completed across the entire World. It is updated only after every target
  document has succeeded.

The World setting is an execution summary, not a substitute for document-level
markers. If a migration is interrupted, already-migrated documents are skipped
on the next run and unmarked documents are retried.

## Migration lifecycle

1. On ready, a GM is told when the World schema is older than the system
   schema. Non-GM users never perform write migrations.
2. The GM receives a summary of affected World Actors, World Items, embedded
   Items, and unlinked Token Actor Deltas. Migration requires explicit
   confirmation after the GM has backed up the World.
3. Pure source-data transformers convert legacy `template.json` shapes before
   documents are updated through Foundry's public document APIs.
4. Each document is marked only after its update succeeds. Failures are
   recorded with the document UUID and do not prevent unrelated documents from
   continuing.
5. A completion report lists migrated, skipped, and failed documents. The
   World marker advances only when the failed count is zero.

## Legacy profile detection

The legacy `tinyd6.theme` World setting supplies the initial game-line profile
when it has a recognized value. Unknown or missing settings are ambiguous and
must prompt the GM to choose a profile; migration must not guess.

## Initial schema version

Schema version 1 represents the Foundry v14 typed `hero`, `npc`, `weapon`,
`armor`, `gear`, `heritage`, and `trait` models. It normalizes legacy scalar
`slots` values into `slots.value` and supplies missing typed-field defaults
through the existing model `migrateData` methods. Later migrations must keep
these transforms idempotent and add a new, ordered version step.
