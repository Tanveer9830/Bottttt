# Sentinel Discord Bot

A security-first Discord administration bot under active development. This repository currently contains the first validated milestone: **75 real administrative actions** for moderation, AutoMod, anti-raid, phishing detection, webhook monitoring, emergency lockdown, audit records, and incident handling.

> The requested 500+ action target is not yet complete. The generated [command inventory](docs/COMMANDS.md) is the source of truth and deliberately does not claim unfinished economy, music, ticket, dashboard, or other systems.

## Requirements

- Node.js 20.11 or newer
- A Discord application/bot token
- Bot intents: Server Members, Message Content, and the standard Guilds intent
- Bot permissions matching the operations you intend to use

## Setup

```bash
npm install
cp .env.example .env
# Populate DISCORD_TOKEN and DISCORD_CLIENT_ID
npm run check
npm test
npm run register
npm start
```

Node does not load `.env` automatically. Export its variables with your process manager, container runtime, or shell. `DISCORD_GUILD_ID` selects fast development-guild registration; without it, registration is global and can take time to propagate.

## Registration safety

`npm run register` validates names, descriptions, option ordering, duplicate paths, Discord option limits, and handler presence before calling Discord. It updates only this application's commands in the chosen guild/global scope. It never reports success unless Discord returns successfully.

## Data and scaling

State is stored in `DATA_FILE` (default `./data/store.json`) using serialized atomic replacements and restrictive file permissions. Run only one bot process against this file. A database is required for multiple replicas. Runtime data and secrets are ignored by Git.

## Security notes

- Authorization is enforced during interaction handling, not only in command metadata.
- Moderation observes actor/bot role hierarchy where Discord requires it.
- Security allowlists exempt automated detections only; they do not bypass staff permissions.
- No user-provided code is evaluated.
- Logs redact common token and authorization fields.
- Phishing detection is heuristic; staff should review incidents and adjust server policy.

## Commands and project status

See [docs/COMMANDS.md](docs/COMMANDS.md) for generated counts and every implemented path. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for implementation details. Generate the inventory with `npm run inventory`.

### External services

No external audio/database/dashboard services are used in this milestone. Lavalink and Discord OAuth2 will be documented only when those systems are implemented.
