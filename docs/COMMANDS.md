# Command inventory

Generated from the executable command registry. Do not edit by hand.

- Top-level chat-input commands: **3**
- Subcommand groups: **0**
- Slash subcommands: **75**
- Distinct implemented actions: **75**
- Administrative actions: **75**
- Normal-user actions: **0**
- Locally registration-validated actions: **75**
- Live Discord registration: **unverified** (requires credentials)

## /automod

Configure and inspect automated message moderation

- `/automod enable` — Enable message AutoMod
- `/automod disable` — Disable message AutoMod
- `/automod status` — Show the effective AutoMod configuration
- `/automod spam-limit` — Set messages allowed per spam window
- `/automod spam-window` — Set spam window in seconds
- `/automod duplicate-limit` — Set repeated-message limit
- `/automod caps-threshold` — Set uppercase percentage threshold
- `/automod links-allow` — Allow links
- `/automod links-block` — Block links
- `/automod invites-allow` — Allow Discord invites
- `/automod invites-block` — Block Discord invites
- `/automod badword-add` — Add a blocked word or phrase
- `/automod badword-remove` — Remove a blocked word or phrase
- `/automod badword-list` — List blocked words and phrases
- `/automod badword-clear` — Clear all blocked words and phrases
- `/automod mention-limit` — Set maximum mentions per message
- `/automod emoji-limit` — Set maximum custom emoji per message
- `/automod attachment-limit` — Set maximum attachments per message
- `/automod account-age` — Set minimum account age in hours
- `/automod log-channel` — Set the AutoMod log channel
- `/automod alert-role` — Set the role pinged for AutoMod alerts
- `/automod exempt-role-add` — Exempt a role from content filters
- `/automod exempt-role-remove` — Remove an AutoMod role exemption
- `/automod exempt-role-list` — List roles exempt from content filters
- `/automod reset` — Reset AutoMod to safe defaults

## /moderation

Moderate members, messages, roles, and voice

- `/moderation ban` — Ban a member from the server
- `/moderation kick` — Kick a member from the server
- `/moderation timeout` — Temporarily timeout a member
- `/moderation untimeout` — Remove a member timeout
- `/moderation warn` — Add a documented warning
- `/moderation warnings` — List a member’s warnings
- `/moderation warning-remove` — Remove one warning by ID
- `/moderation warnings-clear` — Clear all warnings for a member
- `/moderation purge` — Bulk-delete recent messages
- `/moderation slowmode` — Set channel slowmode in seconds
- `/moderation lock` — Prevent everyone from sending in this channel
- `/moderation unlock` — Restore inherited sending permission
- `/moderation nick` — Change or clear a member nickname
- `/moderation role-add` — Add a role to a member
- `/moderation role-remove` — Remove a role from a member
- `/moderation move` — Move a member to a voice channel
- `/moderation voice-mute` — Server-mute a voice member
- `/moderation voice-unmute` — Remove a member’s server mute
- `/moderation voice-deafen` — Server-deafen a voice member
- `/moderation voice-undeafen` — Remove a member’s server deafen
- `/moderation note-add` — Add a private staff note about a member
- `/moderation note-list` — List private staff notes for a member
- `/moderation notes-clear` — Clear private staff notes for a member
- `/moderation softban` — Ban then unban to remove recent messages
- `/moderation voice-kick` — Disconnect a member from voice

## /security

Configure anti-raid, alerts, exemptions, and lockdown

- `/security enable` — Enable raid security
- `/security disable` — Disable raid security
- `/security status` — Show effective security configuration
- `/security raid-threshold` — Set joins needed to trigger raid mode
- `/security raid-window` — Set raid detection window in seconds
- `/security account-age` — Set minimum account age in hours
- `/security lockdown` — Deny everyone from sending in text channels
- `/security unlock` — Restore pre-lockdown send permissions
- `/security phishing-enable` — Enable phishing URL detection
- `/security phishing-disable` — Disable phishing URL detection
- `/security webhook-enable` — Enable webhook abuse monitoring
- `/security webhook-disable` — Disable webhook abuse monitoring
- `/security allow-user-add` — Add a user to security exemptions
- `/security allow-user-remove` — Remove a user security exemption
- `/security allow-role-add` — Add a role to security exemptions
- `/security allow-role-remove` — Remove a role security exemption
- `/security allow-list` — List security exemptions
- `/security allow-clear` — Clear all security exemptions
- `/security alert-channel` — Set the security alert channel
- `/security quarantine-role` — Set role assigned to suspicious new accounts
- `/security audit-tail` — Show recent bot security audit records
- `/security incident-list` — List open security incidents
- `/security incident-resolve` — Resolve a security incident
- `/security alert-test` — Send a test security alert
- `/security reset` — Reset security configuration to safe defaults
