# the100bot — Deploy & Re-Launch Guide

This bot was migrated from **discord.js v13 → v14** (Node 20 LTS) in the
`discordjs-v14-migration` branch. The original Discord application was deleted,
so the bot must be re-launched under a **brand-new Discord application** with a
new token. Every server that previously used the bot must re-invite the new
one.

This guide covers: creating the new Discord app, the invite URL (scopes +
permissions), the environment variables, hosting, and the one change the
`pwntastic` (the100.io Rails) side needs.

---

## 1. Create the new Discord application

1. Go to <https://discord.com/developers/applications> → **New Application**.
   Name it (e.g. "The100.io"). Note the **Application ID** — this is the
   `CLIENT_ID` env var and the `client_id` in every invite URL.
2. **Bot** tab → the application already has a bot user. Click
   **Reset Token** and copy it — this is `DISCORD_BOT_TOKEN`. Treat it like a
   password; never commit it.
3. **Bot** tab → **Privileged Gateway Intents**. Enable:
   - **MESSAGE CONTENT INTENT** — **required.** The bot reads the content and
     embeds of the LFG webhook posts that the100.io drops into group channels
     (`events/handleWebhooks.js`) in order to convert them into interactive
     Join/Leave button messages. Without this intent those posts arrive with
     empty content/embeds and the button conversion silently no-ops.
   - **SERVER MEMBERS INTENT** — recommended. `events/welcome.js` filters guild
     members by Administrator permission to DM/greet admins on join. Not fatal
     if left off (that handler just won't find members), but enable it if you
     want the welcome flow.
   - Presence intent is **not** needed.
4. The three gateway intents the code requests in `index.js` are `Guilds`,
   `GuildMessages`, `GuildMessageReactions`, and `MessageContent`. The first
   three are non-privileged; only Message Content (and optionally Server
   Members) must be toggled on in the portal.

---

## 2. Invite URL (OAuth scopes + permissions)

The bot needs two OAuth2 scopes: `bot` and `applications.commands` (the latter
so its slash commands appear). Groups add it from their **Edit Group** page on
the100.io, which also requests `webhook.incoming` so the group's channel
webhook is created in the same flow.

**Permissions integer:** the Rails app already builds the group-facing invite
URL with `permissions=423591438400` and
`scope=applications.commands identify email webhook.incoming bot`
(see `pwntastic/app/models/discordbot.rb`). That integer covers what the bot
needs at runtime: View Channels, Send Messages, Embed Links, Read Message
History, Add Reactions, and **Manage Messages** (needed to delete the raw
webhook post and replace it with the button embed, and to manage reactions).

For a quick **test-server** invite (bot + commands only, no webhook flow),
build a URL like:

```
https://discord.com/oauth2/authorize?client_id=<APPLICATION_ID>&scope=bot%20applications.commands&permissions=423591438400
```

Replace `<APPLICATION_ID>` with your new Application ID. For real production
groups, the invite comes from the100.io's group edit page (which appends the
webhook scope), so you do **not** hand out a raw URL to group owners.

---

## 3. Register slash commands

Slash commands are registered out-of-band (not on every boot) via
`deploy-commands.js`. Run it once after creating the app and whenever you
add/change a command:

```bash
npm run deploy      # == node deploy-commands.js
```

It reads `CLIENT_ID` + `DISCORD_BOT_TOKEN` and does a global
`Routes.applicationCommands(CLIENT_ID)` PUT (REST v10). Global registration can
take up to ~1 hour to propagate. For instant iteration on a single test
server, set `GUILD_ID` and switch the call in `deploy-commands.js` to
`Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)` (a commented pointer is
in the file). The 10 commands registered: `/count`, `/create`, `/c`,
`/delete`, `/games`, `/help`, `/join`, `/leave`, `/link`, `/the100status`.

---

## 4. Environment variables

Never commit these. Locally they live in a gitignored `.env`; in production set
them as Heroku config vars. Every var referenced by the live code:

| Var | Required | Purpose |
|-----|----------|---------|
| `DISCORD_BOT_TOKEN` | yes | Bot token from the Discord portal. Used for login and command registration. |
| `CLIENT_ID` | yes (for deploy) | Application ID. Used by `deploy-commands.js` to register slash commands. |
| `THE100_API_TOKEN` | yes | the100.io **user API token** sent as `Authorization: Bearer <token>` on every API call. Must belong to the dedicated bot user account (the one `User#is_the100bot?` returns true for) or an api-whitelisted account — see `pwntastic/app/controllers/api/v2/base_controller.rb#authenticate_bot_user`. Generate from that account's edit-profile page. |
| `THE100_API_BASE_URL` | yes | API base, **with trailing slash**, e.g. `https://www.the100.io/api/v2/` (prod) or `https://pwn-staging.herokuapp.com/api/v2/` (staging — note staging has no DB attached, see pwntastic CLAUDE.md). The bot posts to `${THE100_API_BASE_URL}discordbots/<action>`. |
| `THE100_BASE_URL` | recommended | Web base **with trailing slash**, e.g. `https://www.the100.io/`. Only used by `/help` / `/c` embeds to link to `gaming_sessions/new`. If unset those links render malformed but nothing crashes. |
| `OWNER_DISCORD_ID` | optional | Discord user ID that receives DM error reports. Safe to leave unset (error DMs are best-effort / optional-chained). |
| `GUILD_ID` | optional | Only for guild-scoped command registration during testing. |

`.env.example` is worth adding for the next person (not included here to avoid
committing anything token-shaped).

> Note: the old `.env` also had a `DATABSE_URL` [sic]. That fed `utils/sequelize.js`,
> a leftover discord.js-**commando** settings provider that is **not loaded** by
> the current code. It (and `commands/gamingsession/*`, `commands/general/*`) are
> dead code from the Commando era — no Postgres/SQLite is needed to run the bot.

---

## 5. Hosting

`Procfile` declares a single **`worker`** process (`worker: npm start`) — the
bot is a long-running gateway client with **no HTTP server / web dyno**. It
previously ran on Heroku (remotes `production` → `the100bot`, `staging` →
`the100bot-staging`).

Heroku steps to re-launch:

```bash
# from ~/the100bot, after merging this branch to master
heroku config:set -a the100bot \
  DISCORD_BOT_TOKEN=... CLIENT_ID=... \
  THE100_API_TOKEN=... THE100_API_BASE_URL=https://www.the100.io/api/v2/ \
  THE100_BASE_URL=https://www.the100.io/ OWNER_DISCORD_ID=...
git push production master
heroku ps:scale worker=1 -a the100bot     # ensure the worker dyno is on
heroku ps -a the100bot                     # confirm it's up
npm run deploy                             # register slash commands once (or run via `heroku run`)
heroku logs -t -a the100bot                # watch for "Logged in as ..."
```

Node version: `package.json` pins `engines.node >= 20`; Heroku picks a Node 20
build. Any always-on host works (Railway, Fly.io, a VPS with `pm2`, a
Docker container) — the only requirement is a persistent process with the env
vars set. There is no inbound port to expose.

Boot sanity check (no token needed): with an invalid token the process should
log a clean `DiscordjsError [TokenInvalid]` and exit — that means all modules
loaded and only auth is missing.

---

## 6. pwntastic (Rails / the100.io) side changes

Good news: **there are no hardcoded bot/application IDs in the Rails source.**
The Discord integration is driven entirely by env vars, so re-launching under a
new application is a config change, not a code change. On the **`pwntastic`
Heroku app**, update these config vars to the **new** application's values:

| pwntastic config var | What it is |
|----------------------|------------|
| `DISCORD_CLIENT_ID` | New Application ID. Used to build every "add the bot" OAuth URL (`app/models/discordbot.rb`, `app/views/groups/*`, `app/views/discordbots/index.html.erb`). |
| `DISCORD_CLIENT_SECRET` | New app's OAuth2 client secret (Discord portal → OAuth2). Used in `Discordbot.exchange_code` to swap the auth code for a token. |
| `DISCORD_TOKEN` | New bot token. Used in `discordbots_controller#groupauth` for `Authorization: Bot <token>` calls to the Discord REST API. (This is the same value as the bot's `DISCORD_BOT_TOKEN`, just named differently on the Rails side.) |

The OAuth redirect URIs the Rails app uses must also be added to the **new**
application's **OAuth2 → Redirects** allow-list in the Discord portal:

- `<ROOT_URL>api/v2/discordbots/discordauth`
- `<ROOT_URL>api/v2/discordbots/userauth`
- `<ROOT_URL>api/v2/discordbots/groupauth`
- `<ROOT_URL>api/v2/discordbots/simplebot_auth`

(where `<ROOT_URL>` is the100.io's `ENV['ROOT_URL']`, e.g. `https://www.the100.io/`).

**Cosmetic-only leftover:** `app/controllers/api/v2/discordbots_controller.rb`
has two commented-out example URLs containing the *old* client id
`616754792965865495`. They're comments (dead), but worth deleting so nobody
copies the stale ID later.

### The bot user account
The API auth (`authenticate_bot_user`) requires `THE100_API_TOKEN` to belong to
a user where `User#is_the100bot?` is true (or an api-whitelisted account). If
the original bot user account still exists in prod, reuse its api token. If
not, an account must be designated as the bot user and its token used. This is
independent of the Discord application — it's the100.io-side identity.

---

## 7. What the bot calls on the100.io

Every command/event hits `POST ${THE100_API_BASE_URL}discordbots/<action>` with
`Authorization: Bearer ${THE100_API_TOKEN}` and a JSON body that always
includes `guild_id`, `channel_id`, `discord_id`, `username`, `discriminator`
(see `utils/api.js`). Actions used by the live code and their Rails endpoints
(all under `api/v2/discordbots`, routes in `pwntastic/config/routes.rb`):

`user_primary_game`, `find_games`, `find_activities`, `create_gaming_session`,
`create_gaming_session_simple`, `update_gaming_session`,
`refresh_gaming_session`, `join_gaming_session`, `leave_gaming_session`,
`delete_gaming_session`, `list_gaming_sessions`, `bot_status`.

All of these controller actions exist and are wired in routes. A **404/401**
response is surfaced to the user as "No The100.io group found / re-add the
bot"; any other non-201 as a generic "contact support" message.

> Heads-up on `username#discriminator`: the API body still sends `discriminator`,
> and account-linking (`Discordbot.discord_linked_user`) matches on
> `username#discriminator`. Discord has since **retired discriminators** (they're
> now `#0` for migrated accounts). Existing links keyed on old discriminators
> should still match stored values, but new links rely on `discord_id`, which is
> stable. Worth verifying the link flow end-to-end on the Rails side once a real
> token is in hand — flagged, not fixed, since it's a pwntastic-side concern.
