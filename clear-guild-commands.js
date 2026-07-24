// Removes guild-scoped slash-command registrations for one guild.
//
// Global commands (deploy-commands.js without GUILD_ID) are the production
// registration; a guild that ALSO has guild-scoped registrations shows every
// command twice in the Discord UI. Run this against any guild that was used
// for instant-registration testing:
//
//   GUILD_ID=<guild id> node clear-guild-commands.js
require("dotenv").config();

const { REST, Routes } = require("discord.js");

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_BOT_TOKEN;

if (!guildId) {
  console.error("Set GUILD_ID to the guild whose guild-scoped commands should be cleared.");
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
    console.log(`Cleared guild-scoped commands for guild ${guildId}. Global commands are unaffected.`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
