# Architecture

- `src/commands`: declarative command registry and executable action handlers.
- `src/handlers`: interaction and Discord event routing.
- `src/services`: atomic persistence, configuration, audit, and response helpers.
- `scripts/register-commands.js`: validates payloads before replacing this application's commands in the selected scope.
- `scripts/generate-inventory.js`: derives documentation counts from executable handlers.

## Persistence

The first milestone uses a single atomic JSON document. Mutations are serialized in-process and persisted by write-then-rename with mode `0600`. This is suitable for one bot process. A transactional database migration is required before horizontal scaling.

## Authorization

Discord command visibility is only a convenience. Every interaction is checked server-side. Moderation actions also enforce their action-specific Discord permission, Discord role hierarchy, and the bot's role hierarchy where relevant. Security allowlists only exempt automated detections; they never bypass command permissions.
